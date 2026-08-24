-- Bootstrap inicial do Professor IA | AçõesJá
-- Execute uma vez no SQL Editor do Supabase ou com:
-- psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/bootstrap.sql
-- O script é idempotente e não contém credenciais.

begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_lowercase check (email = lower(email)),
  constraint profiles_full_name_length check (full_name is null or char_length(full_name) <= 120)
);

create unique index if not exists profiles_email_lower_key on public.profiles (lower(email));

create table if not exists public.launch_waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text,
  whatsapp text,
  marketing_consent boolean not null default false,
  attribution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint launch_waitlist_email_lowercase check (email = lower(email)),
  constraint launch_waitlist_full_name_length check (full_name is null or char_length(full_name) <= 120),
  constraint launch_waitlist_whatsapp_length check (whatsapp is null or char_length(whatsapp) <= 30),
  constraint launch_waitlist_attribution_object check (jsonb_typeof(attribution) = 'object')
);

create unique index if not exists launch_waitlist_entries_email_key
  on public.launch_waitlist_entries (lower(email));

create table if not exists public.professor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professor_conversations_user_created_idx
  on public.professor_conversations (user_id, created_at desc);

create table if not exists public.professor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.professor_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 12000),
  provider_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists professor_messages_conversation_created_idx
  on public.professor_messages (conversation_id, created_at);

create table if not exists public.professor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  question_count integer not null default 0 check (question_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists launch_waitlist_set_updated_at on public.launch_waitlist_entries;
create trigger launch_waitlist_set_updated_at before update on public.launch_waitlist_entries
  for each row execute procedure public.set_updated_at();

drop trigger if exists professor_conversations_set_updated_at on public.professor_conversations;
create trigger professor_conversations_set_updated_at before update on public.professor_conversations
  for each row execute procedure public.set_updated_at();

-- Entrada pública mínima para a lista de lançamento. A tabela continua privada.
create or replace function public.join_launch_waitlist(
  p_email text,
  p_full_name text default null,
  p_whatsapp text default null,
  p_marketing_consent boolean default false,
  p_attribution jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_id uuid;
begin
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'E-mail inválido' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_attribution, '{}'::jsonb)) <> 'object' then
    raise exception 'Atribuição inválida' using errcode = '22023';
  end if;

  insert into public.launch_waitlist_entries (
    user_id, email, full_name, whatsapp, marketing_consent, attribution
  ) values (
    auth.uid(), v_email, nullif(trim(p_full_name), ''), nullif(trim(p_whatsapp), ''),
    p_marketing_consent, coalesce(p_attribution, '{}'::jsonb)
  )
  on conflict (lower(email)) do update set
    user_id = coalesce(excluded.user_id, public.launch_waitlist_entries.user_id),
    full_name = coalesce(excluded.full_name, public.launch_waitlist_entries.full_name),
    whatsapp = coalesce(excluded.whatsapp, public.launch_waitlist_entries.whatsapp),
    marketing_consent = public.launch_waitlist_entries.marketing_consent or excluded.marketing_consent,
    attribution = public.launch_waitlist_entries.attribution || excluded.attribution,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

-- Apenas o BFF, autenticado com service role, pode consumir e devolver cota.
create or replace function public.reserve_professor_question(p_user_id uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_limit < 1 or p_limit > 1000 then
    raise exception 'Limite inválido' using errcode = '22023';
  end if;

  insert into public.professor_daily_usage (user_id, usage_date, question_count)
  values (p_user_id, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, usage_date) do update set
    question_count = public.professor_daily_usage.question_count + 1,
    updated_at = now()
  where public.professor_daily_usage.question_count < p_limit
  returning question_count into v_count;

  return coalesce(v_count <= p_limit, false);
end;
$$;

create or replace function public.release_professor_question(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.professor_daily_usage
  set question_count = greatest(question_count - 1, 0), updated_at = now()
  where user_id = p_user_id and usage_date = (now() at time zone 'utc')::date;
$$;

alter table public.profiles enable row level security;
alter table public.launch_waitlist_entries enable row level security;
alter table public.professor_conversations enable row level security;
alter table public.professor_messages enable row level security;
alter table public.professor_daily_usage enable row level security;

drop policy if exists "profiles can view own data" on public.profiles;
create policy "profiles can view own data" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles can update own data" on public.profiles;
revoke insert, update, delete on table public.profiles from anon, authenticated;
revoke all on table public.launch_waitlist_entries from anon, authenticated;
revoke all on table public.professor_daily_usage from anon, authenticated;
revoke all on table public.professor_conversations from anon, authenticated;
revoke all on table public.professor_messages from anon, authenticated;
revoke all on function public.reserve_professor_question(uuid, integer) from public, anon, authenticated;
revoke all on function public.release_professor_question(uuid) from public, anon, authenticated;
grant execute on function public.join_launch_waitlist(text, text, text, boolean, jsonb) to anon, authenticated;
grant execute on function public.reserve_professor_question(uuid, integer) to service_role;
grant execute on function public.release_professor_question(uuid) to service_role;

commit;
