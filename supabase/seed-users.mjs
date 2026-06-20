// Seed users script - Jalankan dengan:
// SUPABASE_SERVICE_KEY=service_role_key node supabase/seed-users.mjs
// Atau isi langsung di Supabase SQL Editor setelah SQL migration jalan

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqooksuumnavtgxpqcdv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!serviceKey) {
  console.error('ERROR: Set SUPABASE_SERVICE_KEY environment variable');
  console.log('Dapatkan service_role key dari Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  { username: 'admin001', password: 'password', name: 'Rudi Santoso', role: 'admin' },
  { username: 'manager001', password: 'password', name: 'Sri Handayani', role: 'manager' },
  { username: 'supervisor01', password: 'password', name: 'Andi Wijaya', role: 'supervisor', outlet_id: 'outlet-1', division: 'Es Teh' },
  { username: 'kasir001', password: 'password', name: 'Budi Hartono', role: 'kasir', outlet_id: 'outlet-1', division: 'Es Teh' },
  { username: 'kasir002', password: 'password', name: 'Rini Susanti', role: 'kasir', outlet_id: 'outlet-1', division: 'Es Teh' },
];

async function seed() {
  for (const u of users) {
    const email = `${u.username}@pertamapos.local`;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });

    if (error) {
      console.error(`Failed to create ${u.username}:`, error.message);
      continue;
    }

    // Update profile with correct data
    await supabase.from('profiles').update({
      username: u.username,
      name: u.name,
      role: u.role,
      outlet_id: u.outlet_id || null,
      division: u.division || null,
      is_active: true,
    }).eq('id', data.user.id);

    console.log(`✓ Created ${u.username} (${u.role})`);
  }
  console.log('\nSeed users complete!');
  console.log('Login: username@pertamapos.local / password');
}

seed().catch(console.error);
