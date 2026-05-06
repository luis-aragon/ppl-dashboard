require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log("Testing Supabase Connection...");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in .env.local");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Fetching filter options...");
  const { data: verticals, error: vertError } = await supabase.rpc('fn_get_distinct_verticals');
  
  if (vertError) {
    console.error("Error fetching verticals:", vertError);
  } else {
    console.log("Verticals:", verticals);
  }

  const { data: kpis, error: kpiError } = await supabase.rpc('fn_dashboard_kpis', {
    p_date_from: '2020-01-01',
    p_date_to: '2030-01-01'
  });

  if (kpiError) {
    console.error("Error fetching KPIs:", kpiError);
  } else {
    console.log("KPIs:", kpis);
  }
}

testSupabase();
