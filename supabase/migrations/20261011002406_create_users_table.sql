create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text,
  created_at timestamptz not null default now(),
  reset_otp text,
  reset_otp_expires timestamptz
);
