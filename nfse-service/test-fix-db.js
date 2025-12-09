const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    console.log('Fixing nuvem_id for invoice 28644a37-f1d7-405f-90b6-4b7d1ad2dfc3...');
    const { data, error } = await supabase
        .from('nfs_e')
        .update({ nuvem_id: 'nfs_3a1e1b85472645e88097c16147789eab' })
        .eq('id', '28644a37-f1d7-405f-90b6-4b7d1ad2dfc3')
        .select();

    if (error) console.error('Fix Error:', JSON.stringify(error, null, 2));
    else console.log('Fixed. Data:', JSON.stringify(data, null, 2));
}

fix();
