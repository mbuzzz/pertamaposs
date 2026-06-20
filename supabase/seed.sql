-- =====================================================
-- POS PertamaGroup - Seed Data
-- Run AFTER the migration is complete.
-- Jalankan di Supabase Dashboard -> SQL Editor
-- =====================================================

-- 1. Seed Outlets
insert into public.outlets (id, name, address, phone, is_active, invoice_header, invoice_footer) values
  ('outlet-1', 'Outlet Es Teh Pusat', 'Jl. Main Street No. 123', '(021) 1234-5678', true, 'PERTAMAGROUP ES TEH PUSAT\nNikmat Menyegarkan!', 'Terima kasih atas kunjungan Anda!\nFollow IG kami @es_teh_pertama'),
  ('outlet-2', 'Outlet Es Teh Cabang', 'Jl. Second Street No. 456', '(021) 8765-4321', true, 'PERTAMAGROUP ES TEH CABANG\nSegarnya Tiada Dua!', 'Terima kasih atas kunjungan Anda!\nFollow IG kami @es_teh_pertama'),
  ('outlet-3', 'Outlet Tahu Pusat', 'Jl. Third Avenue No. 789', '(021) 5555-6666', true, 'PERTAMAGROUP TAHU PUSAT\nGurih & Renyah!', 'Terima kasih! Dibuat dengan tahu berkualitas.'),
  ('outlet-4', 'Outlet Roti Bakar', 'Jl. Fourth Road No. 321', '(021) 7777-8888', true, 'PERTAMAGROUP ROTI BAKAR\nManis, Gurih, Lumer!', 'Terima kasih! Roti Bakar Pertama Pilihan Kita.');

-- 2. Seed Ingredients
insert into public.ingredients (id, name, unit, cost_per_unit, stock, min_stock, supplier) values
  ('ing-1', 'Teh', 'gr', 100, 5000, 1000, 'PT Teh Nikmat'),
  ('ing-2', 'Gula', 'gr', 50, 10000, 2000, 'PT Gula Manis'),
  ('ing-3', 'Es Batu', 'gr', 10, 50000, 10000, 'PT Es Sejuk'),
  ('ing-4', 'Gelas Plastik', 'pcs', 500, 1000, 200, 'PT Kemasan Plastik'),
  ('ing-5', 'Sedotan', 'pcs', 100, 2000, 500, 'PT Kemasan Plastik'),
  ('ing-6', 'Plastik Wrap', 'pcs', 200, 1500, 300, 'PT Kemasan Plastik'),
  ('ing-7', 'Tahu Mentah', 'pcs', 3000, 500, 100, 'PT Tahu Segar'),
  ('ing-8', 'Minyak Goreng', 'ml', 20, 20000, 5000, 'PT Minyak Sehat'),
  ('ing-9', 'Roti Tawar', 'pcs', 4000, 300, 50, 'PT Roti Enak'),
  ('ing-10', 'Mentega', 'gr', 80, 5000, 1000, 'PT Mentega Lezat'),
  ('ing-11', 'Selai', 'gr', 60, 3000, 500, 'PT Selai Manis');

-- 3. Seed Products
insert into public.products (id, name, category, selling_price, target_margin, stock, min_stock, max_stock, is_active, division, outlet_ids) values
  ('prod-1', 'Es Teh Manis', 'Es Teh', 5000, 70, 120, 20, 200, true, 'Es Teh', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-2', 'Es Teh Tawar', 'Es Teh', 4000, 65, 15, 20, 200, true, 'Es Teh', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-3', 'Tahu Goreng', 'Tahu', 8000, 50, 80, 30, 150, true, 'Tahu', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-4', 'Roti Bakar', 'Roti Bakar', 10000, 70, 50, 20, 100, true, 'Roti Bakar', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-5', 'Es Teh Lemon', 'Es Teh', 6000, 70, 90, 20, 200, true, 'Es Teh', '{outlet-1,outlet-2,outlet-3,outlet-4}');

-- 4. Seed Recipes
insert into public.recipes (id, product_id, total_cogs, yield_per_batch) values
  ('recipe-1', 'prod-1', 4300, 10),
  ('recipe-2', 'prod-2', 3300, 10),
  ('recipe-3', 'prod-3', 7000, 5),
  ('recipe-4', 'prod-4', 10000, 8);

insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity, cost) values
  ('recipe-1', 'ing-1', 5, 500),
  ('recipe-1', 'ing-2', 20, 1000),
  ('recipe-1', 'ing-3', 200, 2000),
  ('recipe-1', 'ing-4', 1, 500),
  ('recipe-1', 'ing-5', 1, 100),
  ('recipe-1', 'ing-6', 1, 200),
  ('recipe-2', 'ing-1', 5, 500),
  ('recipe-2', 'ing-3', 200, 2000),
  ('recipe-2', 'ing-4', 1, 500),
  ('recipe-2', 'ing-5', 1, 100),
  ('recipe-2', 'ing-6', 1, 200),
  ('recipe-3', 'ing-7', 2, 6000),
  ('recipe-3', 'ing-8', 50, 1000),
  ('recipe-4', 'ing-9', 2, 8000),
  ('recipe-4', 'ing-10', 10, 800),
  ('recipe-4', 'ing-11', 20, 1200);
