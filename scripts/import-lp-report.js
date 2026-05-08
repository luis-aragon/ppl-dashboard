#!/usr/bin/env node
/**
 * Import LP Report + Requests CSVs into lp_leads_raw
 *
 * Usage (carpeta):
 *   node scripts/import-lp-report.js <carpeta>
 *
 * La carpeta debe contener:
 *   - Un CSV de report principal (el que tiene columna "Date" y datos del lead)
 *   - Uno o más CSVs de requests por buyer (ej: buyer_83233.csv, requests_buyer_106648.csv)
 *
 * El script detecta automáticamente cuál es el report y cuáles son los requests.
 */

const fs   = require('fs')
const path = require('path')
const https = require('https')

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://yqsdeufqbmkcznroieki.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc2RldWZxYm1rY3pucm9pZWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk2NjkzNywiZXhwIjoyMDg3NTQyOTM3fQ.m-qLl6Zd8LPc-s0-XEIHhW--fBZqxaz6joD36NxRLtM'
const BATCH_SIZE   = 100

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const raw     = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
  const rows    = []
  let headers   = null
  let field     = ''
  let inQuotes  = false
  let rowFields = []

  for (let i = 0; i < raw.length; i++) {
    const ch   = raw[i]
    const next = raw[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++ }
      else if (ch === '"')            { inQuotes = false }
      else                            { field += ch }
    } else {
      if      (ch === '"')  { inQuotes = true }
      else if (ch === ',')  { rowFields.push(field); field = '' }
      else if (ch === '\n') {
        rowFields.push(field); field = ''
        if (!headers) {
          headers = rowFields.map(h => h.trim())
        } else if (rowFields.some(f => f !== '')) {
          const obj = {}
          headers.forEach((h, idx) => { obj[h] = (rowFields[idx] ?? '').trim() })
          rows.push(obj)
        }
        rowFields = []
      } else {
        field += ch
      }
    }
  }
  if (rowFields.length || field) {
    rowFields.push(field)
    if (headers && rowFields.some(f => f !== '')) {
      const obj = {}
      headers.forEach((h, idx) => { obj[h] = (rowFields[idx] ?? '').trim() })
      rows.push(obj)
    }
  }
  return { headers: headers || [], rows }
}

// ── Detect file roles from headers ───────────────────────────────────────────
function classifyFiles(dir) {
  const csvFiles = fs.readdirSync(dir)
    .filter(f => f.toLowerCase().endsWith('.csv'))
    .map(f => path.join(dir, f))

  if (csvFiles.length === 0) {
    console.error(`❌  No CSV files found in: ${dir}`)
    process.exit(1)
  }

  let reportFile   = null
  const requestFiles = []

  for (const file of csvFiles) {
    const firstLine = fs.readFileSync(file, 'utf8').split('\n')[0]
    const headers   = firstLine.split(',').map(h => h.replace(/"/g, '').trim())

    // Report has "Date" column with lead date/time data
    if (headers.includes('Date') && headers.includes('Supplier')) {
      reportFile = file
    } else if (headers.includes('Lead ID') && headers.includes('Buyer ID')) {
      requestFiles.push(file)
    }
  }

  if (!reportFile) {
    console.error('❌  Could not find report CSV (needs "Date" and "Supplier" columns)')
    console.error('    Files found:', csvFiles.map(f => path.basename(f)).join(', '))
    process.exit(1)
  }

  return { reportFile, requestFiles }
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function supaRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null
    const options = {
      hostname:           'yqsdeufqbmkcznroieki.supabase.co',
      path:               urlPath,
      method,
      rejectUnauthorized: false,
      headers: {
        'apikey':         SERVICE_KEY,
        'Authorization':  `Bearer ${SERVICE_KEY}`,
        'Content-Type':   'application/json',
        'Prefer':         'return=minimal,resolution=ignore-duplicates',
      },
    }
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload)

    const req = https.request(options, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const [,, inputArg] = process.argv
  if (!inputArg) {
    console.error('Usage: node scripts/import-lp-report.js <carpeta>')
    process.exit(1)
  }

  const dir = path.resolve(inputArg)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`❌  Not a directory: ${dir}`)
    process.exit(1)
  }

  // 1. Detect files
  console.log(`\n📂  Folder: ${dir}`)
  const { reportFile, requestFiles } = classifyFiles(dir)
  console.log(`    Report:   ${path.basename(reportFile)}`)
  console.log(`    Requests: ${requestFiles.length} file(s)`)
  requestFiles.forEach(f => console.log(`      • ${path.basename(f)}`))

  // 2. Parse all files
  console.log('\n⏳  Parsing CSVs...')
  const { rows: reportRows } = parseCSV(reportFile)
  console.log(`    Report rows: ${reportRows.length}`)

  const requestRows = []
  for (const f of requestFiles) {
    const { rows } = parseCSV(f)
    requestRows.push(...rows)
    console.log(`    ${path.basename(f)}: ${rows.length} rows`)
  }
  console.log(`    Total request rows: ${requestRows.length}`)

  // 3. Group requests by Lead ID
  const requestsByLead = {}
  for (const r of requestRows) {
    const id = r['Lead ID']
    if (!id) continue
    if (!requestsByLead[id]) requestsByLead[id] = []
    requestsByLead[id].push(r)
  }

  // 4. Build lp_leads_raw records
  const records = []
  for (const row of reportRows) {
    const leadId = row['Lead ID']
    if (!leadId) continue

    const leadDate   = row['Date'] || null
    const status     = row['Status'] || ''
    const supplierId = row['Supplier ID'] || null
    const supplier   = row['Supplier'] || null
    const sellPrice  = parseFloat(row['Sell price']) || 0
    const buyPrice   = parseFloat(row['Buy price'])  || 0

    // Buyer attempts from all request files
    const buyerAttempts = (requestsByLead[leadId] || []).map(r => ({
      id:            parseInt(r['Buyer ID']) || null,
      name:          null,
      status:        r['Status'] || '',
      error_code:    parseInt(r['Error code']) || 0,
      error_message: r['Error message'] || '',
      sell_price:    parseFloat(r['Sell price']) || 0,
      request_sent:  r['Request sent'] === 'Yes',
    }))

    // raw_payload from report fields
    const rawPayload = {
      id:           leadId,
      status,
      supplier:     supplierId ? { id: parseInt(supplierId), name: supplier } : null,
      buyers:       buyerAttempts,
      revenue:      sellPrice,
      cost:         buyPrice,
      lead_date_ms: leadDate ? new Date(leadDate).getTime() : null,
    }
    // Include lead contact/data fields if present
    const leadFields = [
      'first_name','last_name','email','phone','address','city','state',
      'zip_code','ip_address','landing_page_url','source','project_type',
      'trustedform_cert_url','lp_subid1','lp_subid2',
    ]
    for (const f of leadFields) {
      if (row[f]) rawPayload[f] = row[f]
    }

    records.push({
      leadprosper_lead_id: leadId,
      row_hash:            leadId,
      source:              'leadprosper',
      status,
      supplier_name:       supplier,
      supplier_id_lp:      supplierId ? String(parseInt(supplierId)) : null,
      lp_revenue:          sellPrice,
      lp_cost:             buyPrice,
      buyers:              buyerAttempts.length ? buyerAttempts : null,
      lead_created_at:     leadDate ? new Date(leadDate).toISOString() : null,
      raw_payload:         rawPayload,
      processed_to_facts:  false,
    })
  }

  console.log(`\n✅  ${records.length} records ready to insert`)

  // Date range summary
  const dates = records.map(r => r.lead_created_at).filter(Boolean).sort()
  if (dates.length) {
    console.log(`    Date range: ${dates[0].slice(0,10)} → ${dates[dates.length-1].slice(0,10)}`)
  }

  // 5. Insert in batches
  console.log(`\n⬆️   Inserting into lp_leads_raw (batches of ${BATCH_SIZE})...`)
  let inserted = 0, skipped = 0, errors = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const res   = await supaRequest('POST', '/rest/v1/lp_leads_raw', batch)

    if (res.status === 201 || res.status === 200) {
      inserted += batch.length
    } else {
      // Insert one by one to handle duplicates gracefully
      for (const rec of batch) {
        const r = await supaRequest('POST', '/rest/v1/lp_leads_raw', [rec])
        if (r.status === 201 || r.status === 200)          inserted++
        else if (r.status === 409 || r.body?.code === '23505') skipped++
        else {
          errors++
          if (errors <= 3) console.error('\n  ⚠️  Error:', JSON.stringify(r.body))
        }
      }
    }

    const done = Math.min(i + BATCH_SIZE, records.length)
    process.stdout.write(`\r    ${done}/${records.length} (inserted: ${inserted}, skipped: ${skipped})`)
  }
  console.log(`\n\n    ✅  Inserted: ${inserted}  |  Duplicates skipped: ${skipped}  |  Errors: ${errors}`)

  if (inserted === 0) {
    console.log('\n⚠️   Nothing new inserted — all leads may already exist.\n')
    return
  }

  // 6. Sync to lead_facts
  console.log('\n⚙️   Running fn_process_lp_leads_raw()...')
  const fnRes = await supaRequest('POST', '/rest/v1/rpc/fn_process_lp_leads_raw', {})
  if (fnRes.status === 200) {
    const r = fnRes.body || {}
    console.log(`    ✅  processed=${r.processed}  skipped=${r.skipped}  total=${r.total}`)
  } else {
    console.error('    ❌  Function error:', JSON.stringify(fnRes.body))
  }

  console.log('\n🎉  Done!\n')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
