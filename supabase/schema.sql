-- ============================================================
-- MON LIVRE / FABELIA — Supabase Schema
-- Coller dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type product_type      as enum ('digital', 'print', 'bundle');
create type book_format       as enum ('softcover', 'hardcover');
create type order_status      as enum ('draft', 'pending_payment', 'paid', 'processing', 'completed', 'cancelled', 'refunded');
create type payment_status    as enum ('pending', 'authorized', 'captured', 'failed', 'refunded');
create type generation_status as enum ('idle', 'queued', 'generating_text', 'generating_images', 'assembling', 'completed', 'failed');
create type page_type         as enum ('cover', 'dedication', 'chapter', 'illustration', 'back_cover');
create type book_theme        as enum ('space', 'ocean', 'forest', 'castle', 'jungle', 'desert');
create type ticket_status     as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_priority   as enum ('low', 'normal', 'high', 'urgent');
create type score_status      as enum ('pending', 'scored', 'flagged', 'archived');
create type user_role         as enum ('user', 'admin');

-- ============================================================
-- TABLE: profiles
-- ============================================================
create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  full_name      text,
  avatar_url     text,
  role           user_role not null default 'user',
  locale         text not null default 'fr',
  marketing_opt  boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- HELPER FUNCTIONS (after profiles table)
-- ============================================================
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  )
$$;

create or replace function generate_order_number()
returns text
language plpgsql
as $$
declare
  v_number text;
  v_exists boolean;
begin
  loop
    v_number := 'FAB-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
    select exists(select 1 from orders where order_number = v_number) into v_exists;
    exit when not v_exists;
  end loop;
  return v_number;
end;
$$;

-- RLS on profiles
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on profiles for select
  using (is_admin());

create policy "Admins can update all profiles"
  on profiles for update
  using (is_admin());

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- TABLE: book_projects
-- ============================================================
create table book_projects (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  title             text,
  theme             book_theme,
  language          text not null default 'fr',
  generation_status generation_status not null default 'idle',
  product_type      product_type,
  book_format       book_format,
  is_preview_ready  boolean not null default false,
  is_book_ready     boolean not null default false,
  error_message     text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table book_projects enable row level security;

create policy "Users can manage own projects"
  on book_projects for all
  using (auth.uid() = user_id);

create policy "Admins can manage all projects"
  on book_projects for all
  using (is_admin());

create index idx_book_projects_user_id on book_projects(user_id);
create index idx_book_projects_status  on book_projects(generation_status);

-- ============================================================
-- TABLE: dynamic_answers (form inputs stored as key-value)
-- ============================================================
create table dynamic_answers (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references book_projects(id) on delete cascade,
  question_key  text not null,
  answer_value  text,
  updated_at    timestamptz not null default now(),
  unique(project_id, question_key)
);

alter table dynamic_answers enable row level security;

create policy "Users can manage own answers"
  on dynamic_answers for all
  using (
    exists (
      select 1 from book_projects
      where id = dynamic_answers.project_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all answers"
  on dynamic_answers for all
  using (is_admin());

create index idx_dynamic_answers_project on dynamic_answers(project_id);

-- ============================================================
-- TABLE: questions (dynamic question engine)
-- ============================================================
create table questions (
  id           uuid primary key default uuid_generate_v4(),
  key          text not null unique,
  label        text not null,
  placeholder  text,
  field_type   text not null default 'text',
  options      jsonb,
  is_required  boolean not null default false,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

alter table questions enable row level security;

create policy "Anyone can read active questions"
  on questions for select
  using (is_active = true);

create policy "Admins can manage questions"
  on questions for all
  using (is_admin());

-- ============================================================
-- TABLE: prompt_versions
-- ============================================================
create table prompt_versions (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  version     int not null default 1,
  use_case    text not null,
  template    text not null,
  model       text not null default 'gpt-4o',
  temperature numeric(3,2) not null default 0.8,
  max_tokens  int not null default 2000,
  variables   text[] not null default '{}',
  is_active   boolean not null default false,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now(),
  unique(name, version)
);

alter table prompt_versions enable row level security;

create policy "Admins can manage prompt versions"
  on prompt_versions for all
  using (is_admin());

create policy "Server can read prompt versions"
  on prompt_versions for select
  using (true);

-- ============================================================
-- TABLE: prompt_sessions (log every AI call)
-- ============================================================
create table prompt_sessions (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid references book_projects(id) on delete cascade,
  version_id       uuid references prompt_versions(id),
  use_case         text not null,
  resolved_prompt  text not null,
  response         text,
  tokens_used      int,
  latency_ms       int,
  model            text,
  error            text,
  created_at       timestamptz not null default now()
);

alter table prompt_sessions enable row level security;

create policy "Admins can read all prompt sessions"
  on prompt_sessions for all
  using (is_admin());

create policy "Server can insert prompt sessions"
  on prompt_sessions for insert
  with check (true);

create index idx_prompt_sessions_project on prompt_sessions(project_id);

-- ============================================================
-- TABLE: prompt_scores
-- ============================================================
create table prompt_scores (
  id             uuid primary key default uuid_generate_v4(),
  session_id     uuid references prompt_sessions(id) on delete cascade,
  project_id     uuid references book_projects(id) on delete cascade,
  score          numeric(4,2) not null,
  dimensions     jsonb not null default '{}',
  passed         boolean not null default false,
  status         score_status not null default 'pending',
  flagged_reason text,
  reviewed_by    uuid references profiles(id),
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

alter table prompt_scores enable row level security;

create policy "Admins can manage prompt scores"
  on prompt_scores for all
  using (is_admin());

create policy "Server can insert prompt scores"
  on prompt_scores for insert
  with check (true);

create index idx_prompt_scores_project on prompt_scores(project_id);
create index idx_prompt_scores_status  on prompt_scores(status);

-- ============================================================
-- TABLE: book_previews
-- ============================================================
create table book_previews (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references book_projects(id) on delete cascade,
  chapter_title    text,
  chapter_excerpt  text,
  illustration_url text,
  score            numeric(4,2),
  passed           boolean not null default false,
  is_active        boolean not null default true,
  expires_at       timestamptz not null default (now() + interval '7 days'),
  created_at       timestamptz not null default now()
);

alter table book_previews enable row level security;

create policy "Users can read own previews"
  on book_previews for select
  using (
    exists (
      select 1 from book_projects
      where id = book_previews.project_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all previews"
  on book_previews for all
  using (is_admin());

create policy "Server can insert previews"
  on book_previews for insert
  with check (true);

create policy "Server can update previews"
  on book_previews for update
  using (true);

create index idx_book_previews_project on book_previews(project_id);

-- ============================================================
-- TABLE: book_images (covers + illustrations)
-- ============================================================
create table book_images (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references book_projects(id) on delete cascade,
  page_id      uuid,
  style        text,
  url          text not null,
  storage_path text,
  is_cover     boolean not null default false,
  is_selected  boolean not null default false,
  prompt_used  text,
  created_at   timestamptz not null default now()
);

alter table book_images enable row level security;

create policy "Users can read own images"
  on book_images for select
  using (
    exists (
      select 1 from book_projects
      where id = book_images.project_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all images"
  on book_images for all
  using (is_admin());

create policy "Server can insert images"
  on book_images for insert
  with check (true);

create policy "Server can update images"
  on book_images for update
  using (true);

create index idx_book_images_project on book_images(project_id);

-- ============================================================
-- TABLE: book_pages
-- ============================================================
create table book_pages (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references book_projects(id) on delete cascade,
  page_number      int not null,
  page_type        page_type not null,
  chapter_title    text,
  content_text     text,
  illustration_url text,
  image_style      text,
  layout           text,
  metadata         jsonb,
  created_at       timestamptz not null default now(),
  unique(project_id, page_number)
);

alter table book_pages enable row level security;

create policy "Users can read own pages"
  on book_pages for select
  using (
    exists (
      select 1 from book_projects
      where id = book_pages.project_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all pages"
  on book_pages for all
  using (is_admin());

create policy "Server can insert pages"
  on book_pages for insert
  with check (true);

create policy "Server can update pages"
  on book_pages for update
  using (true);

create index idx_book_pages_project on book_pages(project_id);

-- ============================================================
-- TABLE: coupons
-- ============================================================
create table coupons (
  id              uuid primary key default uuid_generate_v4(),
  code            text not null unique,
  discount_type   text not null default 'percent',  -- 'percent' | 'fixed'
  discount_value  numeric(10,2) not null,
  min_amount      int,
  max_uses        int,
  uses_count      int not null default 0,
  valid_from      timestamptz,
  valid_until     timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table coupons enable row level security;

create policy "Anyone can read active coupons by code"
  on coupons for select
  using (is_active = true);

create policy "Admins can manage coupons"
  on coupons for all
  using (is_admin());

-- ============================================================
-- TABLE: orders
-- ============================================================
create table orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id),
  book_project_id  uuid references book_projects(id),
  order_number     text not null unique default generate_order_number(),
  status           order_status not null default 'draft',
  product_type     product_type not null,
  book_format      book_format,
  quantity         int not null default 1,
  unit_price       int not null,   -- centimes
  discount_amount  int not null default 0,
  tax_amount       int not null default 0,
  total_amount     int not null,   -- centimes
  currency         text not null default 'eur',
  coupon_code      text,
  shipping_address jsonb,
  stripe_payment_intent_id text,
  paypal_order_id  text,
  paid_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Users can read own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on orders for all
  using (is_admin());

create policy "Server can update orders"
  on orders for update
  using (true);

create index idx_orders_user_id   on orders(user_id);
create index idx_orders_status    on orders(status);
create index idx_orders_project   on orders(book_project_id);

-- ============================================================
-- TABLE: payments
-- ============================================================
create table payments (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid not null references orders(id),
  provider         text not null,  -- 'stripe' | 'paypal'
  provider_id      text,           -- stripe payment intent id or paypal order id
  status           payment_status not null default 'pending',
  amount           int not null,
  currency         text not null default 'eur',
  metadata         jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table payments enable row level security;

create policy "Users can read own payments"
  on payments for select
  using (
    exists (
      select 1 from orders
      where id = payments.order_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all payments"
  on payments for all
  using (is_admin());

create policy "Server can insert/update payments"
  on payments for insert
  with check (true);

create policy "Server can update payments"
  on payments for update
  using (true);

create index idx_payments_order on payments(order_id);

-- ============================================================
-- TABLE: book_exports
-- ============================================================
create table book_exports (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references book_projects(id) on delete cascade,
  order_id      uuid references orders(id),
  type          text not null default 'digital',  -- 'digital' | 'print'
  storage_path  text not null,
  filename      text not null,
  file_size     bigint,
  generated_at  timestamptz not null default now(),
  download_count int not null default 0,
  last_downloaded_at timestamptz
);

alter table book_exports enable row level security;

create policy "Users can read own exports"
  on book_exports for select
  using (
    exists (
      select 1 from book_projects
      where id = book_exports.project_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all exports"
  on book_exports for all
  using (is_admin());

create policy "Server can insert/update exports"
  on book_exports for insert
  with check (true);

create policy "Server can update exports"
  on book_exports for update
  using (true);

-- ============================================================
-- TABLE: print_jobs
-- ============================================================
create table print_jobs (
  id                  uuid primary key default uuid_generate_v4(),
  order_id            uuid not null references orders(id),
  project_id          uuid not null references book_projects(id),
  provider            text not null default 'mock',
  provider_job_id     text,
  status              text not null default 'pending',
  shipping_address    jsonb not null,
  tracking_number     text,
  tracking_url        text,
  estimated_delivery  date,
  submitted_at        timestamptz,
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table print_jobs enable row level security;

create policy "Users can read own print jobs"
  on print_jobs for select
  using (
    exists (
      select 1 from orders
      where id = print_jobs.order_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all print jobs"
  on print_jobs for all
  using (is_admin());

create policy "Server can insert/update print jobs"
  on print_jobs for insert
  with check (true);

create policy "Server can update print jobs"
  on print_jobs for update
  using (true);

create index idx_print_jobs_order   on print_jobs(order_id);
create index idx_print_jobs_status  on print_jobs(status);

-- ============================================================
-- TABLE: support_tickets
-- ============================================================
create table support_tickets (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references profiles(id),
  order_id     uuid references orders(id),
  project_id   uuid references book_projects(id),
  subject      text not null,
  status       ticket_status not null default 'open',
  priority     ticket_priority not null default 'normal',
  resolved_by  uuid references profiles(id),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table support_tickets enable row level security;

create policy "Users can read own tickets"
  on support_tickets for select
  using (auth.uid() = user_id);

create policy "Users can insert own tickets"
  on support_tickets for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all tickets"
  on support_tickets for all
  using (is_admin());

create policy "Server can insert tickets"
  on support_tickets for insert
  with check (true);

create policy "Server can update tickets"
  on support_tickets for update
  using (true);

create index idx_support_tickets_status   on support_tickets(status);
create index idx_support_tickets_priority on support_tickets(priority);

-- ============================================================
-- TABLE: support_messages
-- ============================================================
create table support_messages (
  id          uuid primary key default uuid_generate_v4(),
  ticket_id   uuid not null references support_tickets(id) on delete cascade,
  author_id   uuid references profiles(id),
  body        text not null,
  is_internal boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table support_messages enable row level security;

create policy "Users can read non-internal messages on own tickets"
  on support_messages for select
  using (
    is_internal = false
    and exists (
      select 1 from support_tickets
      where id = support_messages.ticket_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can manage all messages"
  on support_messages for all
  using (is_admin());

create policy "Server can insert messages"
  on support_messages for insert
  with check (true);

create index idx_support_messages_ticket on support_messages(ticket_id);

-- ============================================================
-- TABLE: admin_logs
-- ============================================================
create table admin_logs (
  id           uuid primary key default uuid_generate_v4(),
  admin_id     uuid not null references profiles(id),
  action       text not null,
  resource     text not null,
  resource_id  uuid,
  before_state jsonb,
  after_state  jsonb,
  ip_address   text,
  created_at   timestamptz not null default now()
);

alter table admin_logs enable row level security;

create policy "Admins can manage all logs"
  on admin_logs for all
  using (is_admin());

create policy "Server can insert logs"
  on admin_logs for insert
  with check (true);

create index idx_admin_logs_admin    on admin_logs(admin_id);
create index idx_admin_logs_resource on admin_logs(resource);
create index idx_admin_logs_created  on admin_logs(created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger trg_book_projects_updated_at
  before update on book_projects
  for each row execute function update_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create trigger trg_payments_updated_at
  before update on payments
  for each row execute function update_updated_at();

create trigger trg_print_jobs_updated_at
  before update on print_jobs
  for each row execute function update_updated_at();

create trigger trg_support_tickets_updated_at
  before update on support_tickets
  for each row execute function update_updated_at();

-- ============================================================
-- STORAGE BUCKETS (à créer manuellement dans Supabase Dashboard)
-- Storage → New bucket :
--   - books     (private)
--   - covers    (public)
--   - exports   (private)
-- ============================================================
