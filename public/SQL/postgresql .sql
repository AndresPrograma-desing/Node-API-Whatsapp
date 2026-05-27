create table public.tenants (
  id character varying not null,
  name character varying not null,
  api_key character varying not null,
  created_at timestamp with time zone not null default now(),
  constraint tenants_pkey primary key (id)
) TABLESPACE pg_default;