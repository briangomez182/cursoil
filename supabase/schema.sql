-- ============================================================
-- PetroLearn | Esquema relacional para Supabase (PostgreSQL)
-- Ejecutar completo en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Usuarios (admin | profesor | alumno) ----------
create table if not exists public.usuarios (
  id            uuid primary key default gen_random_uuid(),
  usuario       text unique not null,
  email         text unique,
  nombre        text not null,
  password_hash text not null,
  rol           text not null default 'alumno' check (rol in ('admin','profesor','alumno')),
  especialidad  text,
  bio           text,
  avatar_url    text,
  telefono      text,
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

-- ---------- Cursos ----------
create table if not exists public.cursos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  slug        text unique not null,
  descripcion text,
  categoria   text not null default 'Upstream',
  nivel       text not null default 'Basico' check (nivel in ('Basico','Intermedio','Avanzado')),
  duracion_horas int not null default 20,
  portada_url text,
  publicado   boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- ---------- Asignacion Profesor <-> Curso ----------
create table if not exists public.curso_profesores (
  id          uuid primary key default gen_random_uuid(),
  curso_id    uuid not null references public.cursos(id) on delete cascade,
  profesor_id uuid not null references public.usuarios(id) on delete cascade,
  unique (curso_id, profesor_id)
);

-- ---------- Modulos ----------
create table if not exists public.modulos (
  id          uuid primary key default gen_random_uuid(),
  curso_id    uuid not null references public.cursos(id) on delete cascade,
  titulo      text not null,
  descripcion text,
  orden       int not null default 1,
  creado_en   timestamptz not null default now()
);

-- ---------- Temas ----------
create table if not exists public.temas (
  id          uuid primary key default gen_random_uuid(),
  modulo_id   uuid not null references public.modulos(id) on delete cascade,
  titulo      text not null,
  descripcion text,
  orden       int not null default 1,
  creado_en   timestamptz not null default now()
);

-- ---------- Items (presentacion | documento | video) ----------
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  tema_id    uuid not null references public.temas(id) on delete cascade,
  titulo     text not null,
  tipo       text not null default 'documento' check (tipo in ('presentacion','documento','video')),
  url        text,        -- Google Slides / YouTube / Vimeo (embed)
  contenido  text,        -- Markdown / HTML enriquecido
  duracion_min int not null default 10,
  orden      int not null default 1,
  creado_en  timestamptz not null default now()
);

-- ---------- Inscripciones de alumnos ----------
create table if not exists public.inscripciones (
  id         uuid primary key default gen_random_uuid(),
  curso_id   uuid not null references public.cursos(id) on delete cascade,
  alumno_id  uuid not null references public.usuarios(id) on delete cascade,
  progreso   int not null default 0,
  creado_en  timestamptz not null default now(),
  unique (curso_id, alumno_id)
);

create index if not exists idx_modulos_curso on public.modulos(curso_id);
create index if not exists idx_temas_modulo on public.temas(modulo_id);
create index if not exists idx_items_tema on public.items(tema_id);

-- ============================================================
-- RLS: el servidor de Next.js usa la SERVICE ROLE KEY (la ignora).
-- Se habilita y se deja lectura publica de contenido publicado.
-- ============================================================
alter table public.usuarios         enable row level security;
alter table public.cursos           enable row level security;
alter table public.modulos          enable row level security;
alter table public.temas            enable row level security;
alter table public.items            enable row level security;
alter table public.curso_profesores enable row level security;
alter table public.inscripciones    enable row level security;

drop policy if exists "lectura publica cursos" on public.cursos;
create policy "lectura publica cursos" on public.cursos for select using (publicado = true);

drop policy if exists "lectura publica modulos" on public.modulos;
create policy "lectura publica modulos" on public.modulos for select using (true);

drop policy if exists "lectura publica temas" on public.temas;
create policy "lectura publica temas" on public.temas for select using (true);

drop policy if exists "lectura publica items" on public.items;
create policy "lectura publica items" on public.items for select using (true);

drop policy if exists "lectura publica asignaciones" on public.curso_profesores;
create policy "lectura publica asignaciones" on public.curso_profesores for select using (true);
