-- Sistema de Tareas del Equipo — esquema Supabase
-- Pega este archivo completo en el SQL Editor de Supabase y ejecutalo una sola vez.

create extension if not exists "pgcrypto";

create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  color text not null
);

create table if not exists tareas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  persona_id uuid references personas(id),
  estado text not null default 'por_hacer' check (estado in ('por_hacer', 'en_progreso', 'hecho')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table personas enable row level security;
alter table tareas enable row level security;

-- Herramienta interna de equipo confiable, sin autenticacion: se otorga acceso
-- completo al rol anon (la clave publishable) en ambas tablas.
create policy "personas_select_anon" on personas for select to anon using (true);
create policy "personas_insert_anon" on personas for insert to anon with check (true);
create policy "personas_update_anon" on personas for update to anon using (true) with check (true);
create policy "personas_delete_anon" on personas for delete to anon using (true);

create policy "tareas_select_anon" on tareas for select to anon using (true);
create policy "tareas_insert_anon" on tareas for insert to anon with check (true);
create policy "tareas_update_anon" on tareas for update to anon using (true) with check (true);
create policy "tareas_delete_anon" on tareas for delete to anon using (true);

alter publication supabase_realtime add table tareas;

insert into personas (nombre, color) values
  ('Angie', '#e07a5f'),
  ('Niray', '#3d8bfd'),
  ('Julieth', '#43aa8b');
