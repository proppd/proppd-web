-- 023_feed_source_auth.sql
-- Adds HTTP authentication support to feed_sources (Basic and Bearer token).
-- Credentials are stored at rest and never returned via the public API — only
-- read server-side by the sync runner.
-- Fully idempotent: safe to run more than once.

alter table public.feed_sources
  add column if not exists auth_type text not null default 'none'
    check (auth_type in ('none', 'basic', 'bearer')),
  add column if not exists auth_username text,
  add column if not exists auth_password text,
  add column if not exists auth_token text;
