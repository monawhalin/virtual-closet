-- Virtual Closet — Supabase SQL schema
-- Run this in the Supabase dashboard SQL editor

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ─── items ────────────────────────────────────────────────────────────────────
create table if not exists items (
  id              text primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  images          text not null default '[]',  -- JSON array of base64 or storage paths
  category        text not null,
  colors          text not null default '[]',  -- JSON array
  tags            text not null default '[]',  -- JSON array
  season          text,
  brand           text,
  url             text,
  notes           text,
  is_favorite     boolean not null default false,
  status          text not null default 'active',
  wear_count      int  not null default 0,
  last_worn_at    bigint,
  created_at      bigint not null,
  updated_at      bigint not null,
  deleted_at      bigint
);

alter table items enable row level security;
create policy "Users can CRUD their own items"
  on items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists items_user_updated on items(user_id, updated_at);

-- ─── capsules ─────────────────────────────────────────────────────────────────
create table if not exists capsules (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  item_ids    text not null default '[]',  -- JSON array
  updated_at  bigint not null,
  deleted_at  bigint
);

alter table capsules enable row level security;
create policy "Users can CRUD their own capsules"
  on capsules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── outfits ──────────────────────────────────────────────────────────────────
create table if not exists outfits (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_ids    text not null default '[]',  -- JSON array
  occasion    text not null,
  capsule_id  text,
  is_favorite boolean not null default false,
  created_at  bigint not null,
  updated_at  bigint not null,
  deleted_at  bigint
);

alter table outfits enable row level security;
create policy "Users can CRUD their own outfits"
  on outfits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── wear_events ──────────────────────────────────────────────────────────────
create table if not exists wear_events (
  id                 text primary key,
  user_id            uuid not null references auth.users(id) on delete cascade,
  outfit_id          text not null,
  worn_at            bigint not null,
  item_ids_snapshot  text not null default '[]',  -- JSON array
  updated_at         bigint not null
);

alter table wear_events enable row level security;
create policy "Users can CRUD their own wear_events"
  on wear_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── user_prefs ───────────────────────────────────────────────────────────────
create table if not exists user_prefs (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  avoid_repeat_days   int  not null default 7,
  prefer_favorites    boolean not null default false,
  updated_at          bigint not null
);

alter table user_prefs enable row level security;
create policy "Users can CRUD their own prefs"
  on user_prefs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
