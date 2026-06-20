-- =====================================================
-- RESET: Drop semua tabel POS (urutan terbalik dari FK)
-- Jalankan ini DULU sebelum migration
-- =====================================================

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.adjust_product_stock(text, integer);
drop function if exists public.adjust_ingredient_stock(text, integer);
drop function if exists public.get_user_role();

drop table if exists public.brew_logs cascade;
drop table if exists public.purchases cascade;
drop table if exists public.expenses cascade;
drop table if exists public.transaction_items cascade;
drop table if exists public.transactions cascade;
drop table if exists public.shifts cascade;
drop table if exists public.recipe_ingredients cascade;
drop table if exists public.recipes cascade;
drop table if exists public.products cascade;
drop table if exists public.ingredients cascade;
drop table if exists public.profiles cascade;
drop table if exists public.outlets cascade;
