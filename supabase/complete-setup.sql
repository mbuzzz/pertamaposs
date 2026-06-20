-- =====================================================
-- POS PertamaGroup - COMPLETE SETUP
-- Copy & paste ENTIRE file into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 0. RESET: Drop existing tables
-- =====================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.adjust_product_stock(text, integer);
drop function if exists public.adjust_ingredient_stock(text, integer);
drop function if exists public.get_user_role() cascade;

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

-- =====================================================
-- 1. TABLES
-- =====================================================

create table public.outlets (
  id              text primary key default gen_random_uuid()::text,
  name            text not null,
  address         text,
  phone           text,
  is_active       boolean default true,
  invoice_header  text,
  invoice_footer  text,
  created_at      timestamptz default now()
);

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  name       text not null,
  role       text not null check (role in ('admin', 'manager', 'supervisor', 'kasir')),
  outlet_id  text references public.outlets(id),
  division   text,
  is_active  boolean default true,
  created_at timestamptz default now()
);

create table public.ingredients (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  unit          text not null,
  cost_per_unit integer not null,
  stock         integer default 0,
  min_stock     integer default 0,
  supplier      text,
  outlet_id     text references public.outlets(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table public.products (
  id             text primary key default gen_random_uuid()::text,
  name           text not null,
  category       text not null,
  selling_price  integer not null,
  target_margin  integer not null,
  image_url      text,
  stock          integer default 0,
  min_stock      integer default 0,
  max_stock      integer default 0,
  is_active      boolean default true,
  division       text,
  outlet_ids     text[],
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table public.recipes (
  id              text primary key default gen_random_uuid()::text,
  product_id      text unique not null references public.products(id) on delete cascade,
  total_cogs      integer not null,
  yield_per_batch integer default 1,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table public.recipe_ingredients (
  id             text primary key default gen_random_uuid()::text,
  recipe_id      text not null references public.recipes(id) on delete cascade,
  ingredient_id  text not null references public.ingredients(id),
  quantity       integer not null,
  cost           integer not null
);

create table public.shifts (
  id              text primary key default gen_random_uuid()::text,
  shift_number    smallint not null check (shift_number in (1, 2, 3)),
  kasir_id        uuid not null references public.profiles(id),
  kasir_name      text not null,
  outlet_id       text not null references public.outlets(id),
  opening_balance integer not null,
  closing_balance integer,
  actual_balance  integer,
  variance        integer,
  opened_at       timestamptz default now(),
  closed_at       timestamptz,
  notes           text,
  status          text default 'open' check (status in ('open', 'closed'))
);

create table public.transactions (
  id                text primary key default gen_random_uuid()::text,
  transaction_no    text unique not null,
  shift_id          text not null references public.shifts(id),
  kasir_id          uuid not null references public.profiles(id),
  kasir_name        text not null,
  outlet_id         text not null references public.outlets(id),
  subtotal          integer not null,
  discount          integer default 0,
  total             integer not null,
  total_cogs        integer not null,
  total_margin      integer not null,
  margin_percentage real not null,
  payment_method    text not null check (payment_method in ('cash', 'qris', 'transfer')),
  payment_amount    integer not null,
  change_amount     integer not null,
  created_at        timestamptz default now()
);

create table public.transaction_items (
  id              text primary key default gen_random_uuid()::text,
  transaction_id  text not null references public.transactions(id) on delete cascade,
  product_id      text not null references public.products(id),
  product_name    text not null,
  quantity        integer not null,
  price           integer not null,
  cogs            integer not null,
  margin          integer not null,
  subtotal        integer not null
);

create table public.expenses (
  id          text primary key default gen_random_uuid()::text,
  description text not null,
  amount      integer not null,
  outlet_id   text not null references public.outlets(id),
  category    text not null,
  date        timestamptz not null,
  created_by  uuid not null references public.profiles(id)
);

create table public.purchases (
  id              text primary key default gen_random_uuid()::text,
  ingredient_id   text not null references public.ingredients(id),
  ingredient_name text not null,
  quantity        integer not null,
  unit            text not null,
  cost            integer not null,
  outlet_id       text not null references public.outlets(id),
  supplier        text,
  date            timestamptz not null,
  created_by      uuid not null references public.profiles(id)
);

create table public.brew_logs (
  id            text primary key default gen_random_uuid()::text,
  recipe_id     text not null references public.recipes(id),
  product_name  text not null,
  batches       integer not null,
  yield_amount  integer not null,
  date          timestamptz not null,
  created_by    uuid not null references public.profiles(id),
  outlet_id     text not null references public.outlets(id)
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_outlet on public.profiles(outlet_id);
create index idx_products_category on public.products(category);
create index idx_products_outlets on public.products using gin(outlet_ids);
create index idx_shifts_outlet on public.shifts(outlet_id);
create index idx_shifts_kasir on public.shifts(kasir_id);
create index idx_shifts_status on public.shifts(status);
create index idx_transactions_shift on public.transactions(shift_id);
create index idx_transactions_outlet on public.transactions(outlet_id);
create index idx_transactions_kasir on public.transactions(kasir_id);
create index idx_transactions_created on public.transactions(created_at);
create index idx_transaction_items_transaction on public.transaction_items(transaction_id);
create index idx_expenses_outlet on public.expenses(outlet_id);
create index idx_purchases_outlet on public.purchases(outlet_id);
create index idx_brew_logs_outlet on public.brew_logs(outlet_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

alter table public.outlets enable row level security;
alter table public.profiles enable row level security;
alter table public.ingredients enable row level security;
alter table public.products enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.shifts enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.expenses enable row level security;
alter table public.purchases enable row level security;
alter table public.brew_logs enable row level security;

create or replace function public.get_user_role()
returns text
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  return (select role from public.profiles where id = auth.uid());
end;
$$;

-- Outlets
create policy "outlets_select_all" on public.outlets for select using (true);
create policy "outlets_insert_admin" on public.outlets for insert with check (public.get_user_role() = 'admin');
create policy "outlets_update_admin" on public.outlets for update using (public.get_user_role() = 'admin');
create policy "outlets_delete_admin" on public.outlets for delete using (public.get_user_role() = 'admin');

-- Profiles
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.get_user_role() in ('admin', 'manager'));
create policy "profiles_insert_admin" on public.profiles for insert with check (public.get_user_role() = 'admin');
create policy "profiles_update_admin" on public.profiles for update using (public.get_user_role() = 'admin') with check (public.get_user_role() = 'admin');
create policy "profiles_delete_admin" on public.profiles for delete using (public.get_user_role() = 'admin');

-- Ingredients
create policy "ingredients_select_all" on public.ingredients for select using (true);
create policy "ingredients_insert_admin_manager" on public.ingredients for insert with check (public.get_user_role() in ('admin', 'manager'));
create policy "ingredients_update_admin_manager" on public.ingredients for update using (public.get_user_role() in ('admin', 'manager'));
create policy "ingredients_delete_admin_manager" on public.ingredients for delete using (public.get_user_role() in ('admin', 'manager'));

-- Products
create policy "products_select_active" on public.products for select using (is_active = true or public.get_user_role() in ('admin', 'manager'));
create policy "products_insert_admin_manager" on public.products for insert with check (public.get_user_role() in ('admin', 'manager'));
create policy "products_update_admin_manager" on public.products for update using (public.get_user_role() in ('admin', 'manager'));
create policy "products_delete_admin_manager" on public.products for delete using (public.get_user_role() in ('admin', 'manager'));

-- Recipes
create policy "recipes_select_all" on public.recipes for select using (true);
create policy "recipes_insert_admin_manager" on public.recipes for insert with check (public.get_user_role() in ('admin', 'manager'));
create policy "recipes_update_admin_manager" on public.recipes for update using (public.get_user_role() in ('admin', 'manager'));
create policy "recipes_delete_admin_manager" on public.recipes for delete using (public.get_user_role() in ('admin', 'manager'));

-- Recipe Ingredients
create policy "recipe_ingredients_select_all" on public.recipe_ingredients for select using (true);
create policy "recipe_ingredients_insert_admin_manager" on public.recipe_ingredients for insert with check (public.get_user_role() in ('admin', 'manager'));
create policy "recipe_ingredients_update_admin_manager" on public.recipe_ingredients for update using (public.get_user_role() in ('admin', 'manager'));
create policy "recipe_ingredients_delete_admin_manager" on public.recipe_ingredients for delete using (public.get_user_role() in ('admin', 'manager'));

-- Shifts
create policy "shifts_select_own" on public.shifts for select using (kasir_id = auth.uid() or outlet_id in (select outlet_id from public.profiles where id = auth.uid()) or public.get_user_role() in ('supervisor', 'manager', 'admin'));
create policy "shifts_insert_kasir" on public.shifts for insert with check (kasir_id = auth.uid());
create policy "shifts_update_supervisor" on public.shifts for update using (public.get_user_role() in ('supervisor', 'manager', 'admin'));
create policy "shifts_delete_admin" on public.shifts for delete using (public.get_user_role() = 'admin');

-- Transactions
create policy "transactions_select_own" on public.transactions for select using (kasir_id = auth.uid() or public.get_user_role() in ('supervisor', 'manager', 'admin'));
create policy "transactions_insert" on public.transactions for insert with check (kasir_id = auth.uid() or public.get_user_role() in ('admin'));
create policy "transactions_update_admin" on public.transactions for update using (public.get_user_role() = 'admin');
create policy "transactions_delete_admin" on public.transactions for delete using (public.get_user_role() = 'admin');

-- Transaction Items
create policy "transaction_items_select_own" on public.transaction_items for select using (transaction_id in (select id from public.transactions where kasir_id = auth.uid() or public.get_user_role() in ('supervisor', 'manager', 'admin')));
create policy "transaction_items_insert" on public.transaction_items for insert with check (transaction_id in (select id from public.transactions where kasir_id = auth.uid() or public.get_user_role() in ('admin')));

-- Expenses
create policy "expenses_select_manager" on public.expenses for select using (public.get_user_role() in ('manager', 'admin'));
create policy "expenses_insert_manager" on public.expenses for insert with check (public.get_user_role() in ('manager', 'admin'));
create policy "expenses_update_manager" on public.expenses for update using (public.get_user_role() in ('manager', 'admin'));
create policy "expenses_delete_manager" on public.expenses for delete using (public.get_user_role() in ('manager', 'admin'));

-- Purchases
create policy "purchases_select_manager" on public.purchases for select using (public.get_user_role() in ('manager', 'admin'));
create policy "purchases_insert_manager" on public.purchases for insert with check (public.get_user_role() in ('manager', 'admin'));
create policy "purchases_update_manager" on public.purchases for update using (public.get_user_role() in ('manager', 'admin'));
create policy "purchases_delete_manager" on public.purchases for delete using (public.get_user_role() in ('manager', 'admin'));

-- Brew Logs
create policy "brew_logs_select_all" on public.brew_logs for select using (true);
create policy "brew_logs_insert" on public.brew_logs for insert with check (created_by = auth.uid() or public.get_user_role() in ('manager', 'admin'));
create policy "brew_logs_update_manager" on public.brew_logs for update using (public.get_user_role() in ('manager', 'admin'));
create policy "brew_logs_delete_manager" on public.brew_logs for delete using (public.get_user_role() in ('manager', 'admin'));

-- =====================================================
-- 4. TRIGGER: auto-create profile on signup
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _username text;
  _role     text;
begin
  _username := split_part(new.email, '@', 1);
  _role := coalesce(
    new.raw_user_meta_data ->> 'role',
    case
      when _username like 'admin%'      then 'admin'
      when _username like 'manager%'    then 'manager'
      when _username like 'supervisor%' then 'supervisor'
      else 'kasir'
    end
  );

  insert into public.profiles (id, username, name, role)
  values (
    new.id,
    _username,
    coalesce(new.raw_user_meta_data ->> 'name', _username),
    _role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================================================
-- 5. RPC FUNCTIONS
-- =====================================================

create or replace function public.create_user_admin(
  p_username text,
  p_email text,
  p_password text,
  p_name text,
  p_role text,
  p_outlet_id text,
  p_division text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_user_id uuid;
begin
  if (select role from public.profiles where id = auth.uid()) != 'admin' then
    raise exception 'Hanya administrator yang dapat membuat pengguna baru.';
  end if;

  new_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', p_name, 'role', p_role),
    now(),
    now()
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', p_email),
    'email',
    p_email,
    now(),
    now(),
    now()
  );

  update public.profiles
  set username = p_username,
      name = p_name,
      role = p_role,
      outlet_id = p_outlet_id,
      division = p_division
  where id = new_user_id;

  return new_user_id;
end;
$$;

create or replace function public.delete_user_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select role from public.profiles where id = auth.uid()) != 'admin' then
    raise exception 'Hanya administrator yang dapat menghapus pengguna.';
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

create or replace function public.adjust_product_stock(product_id text, amount integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.products
  set stock = greatest(0, stock + amount),
      updated_at = now()
  where id = product_id;
end;
$$;

create or replace function public.adjust_ingredient_stock(ingredient_id text, amount integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.ingredients
  set stock = greatest(0, stock + amount),
      updated_at = now()
  where id = ingredient_id;
end;
$$;

-- =====================================================
-- 6. SEED DATA
-- =====================================================

insert into public.outlets (id, name, address, phone, is_active, invoice_header, invoice_footer) values
  ('outlet-1', 'Outlet Es Teh Pusat', 'Jl. Main Street No. 123', '(021) 1234-5678', true, 'PERTAMAGROUP ES TEH PUSAT\nNikmat Menyegarkan!', 'Terima kasih atas kunjungan Anda!\nFollow IG kami @es_teh_pertama'),
  ('outlet-2', 'Outlet Es Teh Cabang', 'Jl. Second Street No. 456', '(021) 8765-4321', true, 'PERTAMAGROUP ES TEH CABANG\nSegarnya Tiada Dua!', 'Terima kasih atas kunjungan Anda!\nFollow IG kami @es_teh_pertama'),
  ('outlet-3', 'Outlet Tahu Pusat', 'Jl. Third Avenue No. 789', '(021) 5555-6666', true, 'PERTAMAGROUP TAHU PUSAT\nGurih & Renyah!', 'Terima kasih! Dibuat dengan tahu berkualitas.'),
  ('outlet-4', 'Outlet Roti Bakar', 'Jl. Fourth Road No. 321', '(021) 7777-8888', true, 'PERTAMAGROUP ROTI BAKAR\nManis, Gurih, Lumer!', 'Terima kasih! Roti Bakar Pertama Pilihan Kita.');

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

insert into public.products (id, name, category, selling_price, target_margin, stock, min_stock, max_stock, is_active, division, outlet_ids) values
  ('prod-1', 'Es Teh Manis', 'Es Teh', 5000, 70, 120, 20, 200, true, 'Es Teh', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-2', 'Es Teh Tawar', 'Es Teh', 4000, 65, 15, 20, 200, true, 'Es Teh', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-3', 'Tahu Goreng', 'Tahu', 8000, 50, 80, 30, 150, true, 'Tahu', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-4', 'Roti Bakar', 'Roti Bakar', 10000, 70, 50, 20, 100, true, 'Roti Bakar', '{outlet-1,outlet-2,outlet-3,outlet-4}'),
  ('prod-5', 'Es Teh Lemon', 'Es Teh', 6000, 70, 90, 20, 200, true, 'Es Teh', '{outlet-1,outlet-2,outlet-3,outlet-4}');

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
