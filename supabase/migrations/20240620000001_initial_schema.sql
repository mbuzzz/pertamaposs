-- =====================================================
-- POS PertamaGroup - Initial Schema Migration
-- Run this in Supabase Dashboard -> SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Outlets
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

-- Profiles (extends auth.users) - id MUST be uuid to match auth.users
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

-- Ingredients
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

-- Products
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

-- Recipes
create table public.recipes (
  id              text primary key default gen_random_uuid()::text,
  product_id      text unique not null references public.products(id) on delete cascade,
  total_cogs      integer not null,
  yield_per_batch integer default 1,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Recipe Ingredients (junction)
create table public.recipe_ingredients (
  id             text primary key default gen_random_uuid()::text,
  recipe_id      text not null references public.recipes(id) on delete cascade,
  ingredient_id  text not null references public.ingredients(id),
  quantity       integer not null,
  cost           integer not null
);

-- Shifts
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

-- Transactions
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

-- Transaction Items (junction)
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

-- Expenses
create table public.expenses (
  id          text primary key default gen_random_uuid()::text,
  description text not null,
  amount      integer not null,
  outlet_id   text not null references public.outlets(id),
  category    text not null,
  date        timestamptz not null,
  created_by  uuid not null references public.profiles(id)
);

-- Purchases
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

-- Brew Logs
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

-- Enable RLS on all tables
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

-- Helper function to get current user's role
create or replace function public.get_user_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- =====================================================
-- 3a. OUTLETS RLS
-- =====================================================

create policy "outlets_select_all"
  on public.outlets for select
  using (true);

create policy "outlets_insert_admin"
  on public.outlets for insert
  with check (public.get_user_role() = 'admin');

create policy "outlets_update_admin"
  on public.outlets for update
  using (public.get_user_role() = 'admin');

create policy "outlets_delete_admin"
  on public.outlets for delete
  using (public.get_user_role() = 'admin');

-- =====================================================
-- 3b. PROFILES RLS
-- =====================================================

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid() or public.get_user_role() in ('admin', 'manager'));

create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.get_user_role() = 'admin');

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.get_user_role() = 'admin');

-- =====================================================
-- 3c. INGREDIENTS RLS
-- =====================================================

create policy "ingredients_select_all"
  on public.ingredients for select
  using (true);

create policy "ingredients_insert_admin_manager"
  on public.ingredients for insert
  with check (public.get_user_role() in ('admin', 'manager'));

create policy "ingredients_update_admin_manager"
  on public.ingredients for update
  using (public.get_user_role() in ('admin', 'manager'));

create policy "ingredients_delete_admin_manager"
  on public.ingredients for delete
  using (public.get_user_role() in ('admin', 'manager'));

-- =====================================================
-- 3d. PRODUCTS RLS
-- =====================================================

create policy "products_select_active"
  on public.products for select
  using (is_active = true or public.get_user_role() in ('admin', 'manager'));

create policy "products_insert_admin_manager"
  on public.products for insert
  with check (public.get_user_role() in ('admin', 'manager'));

create policy "products_update_admin_manager"
  on public.products for update
  using (public.get_user_role() in ('admin', 'manager'));

create policy "products_delete_admin_manager"
  on public.products for delete
  using (public.get_user_role() in ('admin', 'manager'));

-- =====================================================
-- 3e. RECIPES RLS
-- =====================================================

create policy "recipes_select_all"
  on public.recipes for select
  using (true);

create policy "recipes_insert_admin_manager"
  on public.recipes for insert
  with check (public.get_user_role() in ('admin', 'manager'));

create policy "recipes_update_admin_manager"
  on public.recipes for update
  using (public.get_user_role() in ('admin', 'manager'));

create policy "recipes_delete_admin_manager"
  on public.recipes for delete
  using (public.get_user_role() in ('admin', 'manager'));

-- =====================================================
-- 3f. RECIPE_INGREDIENTS RLS
-- =====================================================

create policy "recipe_ingredients_select_all"
  on public.recipe_ingredients for select
  using (true);

create policy "recipe_ingredients_insert_admin_manager"
  on public.recipe_ingredients for insert
  with check (public.get_user_role() in ('admin', 'manager'));

create policy "recipe_ingredients_update_admin_manager"
  on public.recipe_ingredients for update
  using (public.get_user_role() in ('admin', 'manager'));

create policy "recipe_ingredients_delete_admin_manager"
  on public.recipe_ingredients for delete
  using (public.get_user_role() in ('admin', 'manager'));

-- =====================================================
-- 3g. SHIFTS RLS
-- =====================================================

create policy "shifts_select_own"
  on public.shifts for select
  using (
    kasir_id = auth.uid()
    or outlet_id in (
      select outlet_id from public.profiles where id = auth.uid()
    )
    or public.get_user_role() in ('supervisor', 'manager', 'admin')
  );

create policy "shifts_insert_kasir"
  on public.shifts for insert
  with check (kasir_id = auth.uid());

create policy "shifts_update_supervisor"
  on public.shifts for update
  using (public.get_user_role() in ('supervisor', 'manager', 'admin'));

create policy "shifts_delete_admin"
  on public.shifts for delete
  using (public.get_user_role() = 'admin');

-- =====================================================
-- 3h. TRANSACTIONS RLS
-- =====================================================

create policy "transactions_select_own"
  on public.transactions for select
  using (
    kasir_id = auth.uid()
    or public.get_user_role() in ('supervisor', 'manager', 'admin')
  );

create policy "transactions_insert"
  on public.transactions for insert
  with check (
    kasir_id = auth.uid()
    or public.get_user_role() in ('admin')
  );

create policy "transactions_update_admin"
  on public.transactions for update
  using (public.get_user_role() = 'admin');

create policy "transactions_delete_admin"
  on public.transactions for delete
  using (public.get_user_role() = 'admin');

-- =====================================================
-- 3i. TRANSACTION_ITEMS RLS
-- =====================================================

create policy "transaction_items_select_own"
  on public.transaction_items for select
  using (
    transaction_id in (
      select id from public.transactions
      where kasir_id = auth.uid()
      or public.get_user_role() in ('supervisor', 'manager', 'admin')
    )
  );

create policy "transaction_items_insert"
  on public.transaction_items for insert
  with check (
    transaction_id in (
      select id from public.transactions
      where kasir_id = auth.uid()
      or public.get_user_role() in ('admin')
    )
  );

-- =====================================================
-- 3j. EXPENSES RLS
-- =====================================================

create policy "expenses_select_manager"
  on public.expenses for select
  using (public.get_user_role() in ('manager', 'admin'));

create policy "expenses_insert_manager"
  on public.expenses for insert
  with check (public.get_user_role() in ('manager', 'admin'));

create policy "expenses_update_manager"
  on public.expenses for update
  using (public.get_user_role() in ('manager', 'admin'));

create policy "expenses_delete_manager"
  on public.expenses for delete
  using (public.get_user_role() in ('manager', 'admin'));

-- =====================================================
-- 3k. PURCHASES RLS
-- =====================================================

create policy "purchases_select_manager"
  on public.purchases for select
  using (public.get_user_role() in ('manager', 'admin'));

create policy "purchases_insert_manager"
  on public.purchases for insert
  with check (public.get_user_role() in ('manager', 'admin'));

create policy "purchases_update_manager"
  on public.purchases for update
  using (public.get_user_role() in ('manager', 'admin'));

create policy "purchases_delete_manager"
  on public.purchases for delete
  using (public.get_user_role() in ('manager', 'admin'));

-- =====================================================
-- 3l. BREW_LOGS RLS
-- =====================================================

create policy "brew_logs_select_all"
  on public.brew_logs for select
  using (true);

create policy "brew_logs_insert"
  on public.brew_logs for insert
  with check (
    created_by = auth.uid()
    or public.get_user_role() in ('manager', 'admin')
  );

create policy "brew_logs_update_manager"
  on public.brew_logs for update
  using (public.get_user_role() in ('manager', 'admin'));

create policy "brew_logs_delete_manager"
  on public.brew_logs for delete
  using (public.get_user_role() in ('manager', 'admin'));

-- =====================================================
-- 4. TRIGGER: auto-create profile on signup
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'kasir')
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

-- Adjust product stock (positive = add, negative = subtract)
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

-- Adjust ingredient stock (positive = add, negative = subtract)
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
