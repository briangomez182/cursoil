# PetroLearn | Cursos de la Industria Petrolera

Plataforma educativa de formacion industrial construida con **Next.js 14 (App Router)**, **TypeScript**,
**Tailwind CSS**, **Framer Motion**, **Three.js (@react-three/fiber + drei)** y **Supabase**.

Puerto Piritu, Anzoategui - Venezuela | Agendas: **+58 412-796 0996**

---

## 1. Instalacion

```bash
npm install
cp .env.local.example .env.local
```

## 2. Base de datos (Supabase)

1. Crea un proyecto en https://supabase.com
2. Abre **SQL Editor > New query**, pega el contenido de `supabase/schema.sql` y ejecutalo.
3. Copia en `.env.local` (Project Settings > API):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET` (cualquier cadena larga y aleatoria)
4. Carga el equipo inicial y cursos de ejemplo:

```bash
npm run seed
```

### Credenciales generadas por el seed

| Rol | Usuario | Clave |
| --- | --- | --- |
| Administrador | `admin` | `admin` |
| Profesor 1 | `jmendoza` | `profesor123` |
| Profesor 2 | `lrivas` | `profesor123` |
| Profesor 3 | `cbastidas` | `profesor123` |

> Sin Supabase configurado la landing funciona con contenido demo y `admin/admin` entra al panel.

## 3. Desarrollo

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # verificacion de tipos
npm run build      # build de produccion
```

---

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `/` | Landing con Hero 3D, buscador con filtros por categoria y nivel, grilla de cursos, profesores y footer |
| `/cursos/[slug]` | Programa del curso con visor de items (Slides, documento, video) |
| `/login` | Autenticacion de alumnos, profesores y admin |
| `/register` | Registro de alumnos |
| `/admin` | Dashboard protegido: CRUD de profesores, cursos, modulos, temas, items y asignaciones |
| `/profesor` | Panel de los profesores para gestionar el material de sus clases |
| `/terminos` | Terminos y condiciones |
| `not-found` | 404 personalizada con balancin animado |

## Arquitectura de contenidos

```
Curso -> Modulo -> Tema -> Item
                            |- presentacion (Google Slides embebido)
                            |- documento    (Markdown / HTML enriquecido)
                            |- video        (YouTube / Vimeo embebido)
```

## API

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Inicio de sesion (cookie firmada HMAC) |
| `POST` | `/api/auth/register` | Registro de alumnos |
| `POST` | `/api/auth/logout` | Cierre de sesion |
| `GET` / `POST` | `/api/recursos/[tabla]` | Listar / crear |
| `PATCH` / `DELETE` | `/api/recursos/[tabla]/[id]` | Editar / eliminar |

Tablas permitidas: `usuarios`, `cursos`, `modulos`, `temas`, `items`, `curso_profesores`, `inscripciones`.
La escritura esta restringida por rol (`admin` total; `profesor` sobre modulos, temas e items).

## Notas tecnicas

- Cero `var`: solo `const` / `let` con tipado estricto (`strict: true`).
- HTML semantico: `header`, `main`, `nav`, `section`, `article`, `aside`, `address`, `footer`.
- Contrasenas con `scrypt` (sal por usuario) y sesion en cookie httpOnly firmada.
- El canvas 3D se carga con `next/dynamic` y `ssr: false`.
