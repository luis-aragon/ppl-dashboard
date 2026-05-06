require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testFilters() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Testing fn_dashboard_kpis with empty arrays (should work)");
  const { data: noFilters, error: err1 } = await supabase.rpc('fn_dashboard_kpis', {
    p_date_from: '2023-01-01',
    p_date_to: '2026-12-31',
    p_suppliers: [],
    p_buyers: [],
    p_verticals: []
  });
  console.log(err1 ? `Error 1: ${err1.message}` : "Success 1");

  console.log("Testing fn_dashboard_kpis with a dummy supplier array");
  const { data: withSupplier, error: err2 } = await supabase.rpc('fn_dashboard_kpis', {
    p_date_from: '2023-01-01',
    p_date_to: '2026-12-31',
    p_suppliers: ['00000000-0000-0000-0000-000000000000'],
    p_buyers: [],
    p_verticals: []
  });
  console.log(err2 ? `Error 2: ${err2.message}` : "Success 2");
}

testFilters();
