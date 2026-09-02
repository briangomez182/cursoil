# Cursoil | Cursos de la Industria Petrolera

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

### Imagenes de portada (Storage)

El `schema.sql` crea el bucket publico **`portadas`**. Desde `/admin > Cursos` el administrador
sube una imagen por curso (campo **Imagen de portada**); el archivo se guarda en ese bucket via
`POST /api/uploads` y la URL publica queda en `cursos.portada_url`, que se muestra en la tarjeta
del curso en la home y en la cabecera de `/cursos/[slug]`. Si prefieres crearlo a mano:
**Storage > New bucket > `portadas` > Public**.

### Examen final por modulo

Cada modulo tiene un **examen final** de 10 preguntas de opcion multiple (4 opciones, 1 correcta).

1. Ejecuta el `schema.sql` actualizado (crea `preguntas` e `intentos_examen`; es idempotente).
2. `npm run seed` inserta **10 preguntas de prueba por modulo** que aun no tenga examen
   (no pisa las que ya cargaste).
3. Gestiona las preguntas reales en **`/admin` > pestana Examenes** (tambien disponible para profesores).

El alumno rinde el examen al final de cada modulo en `/cursos/[slug]` (solo con sesion de alumno).
La correccion ocurre en el servidor (`POST /api/examen`): `preguntas.correcta` **nunca** se envia al
navegador. Se aprueba con 70% y cada intento queda en `intentos_examen`.

#### Importar un examen desde `.json`

En **`/admin` > Examenes** el boton **Importar JSON** abre un dialogo: eliges el modulo, subes el
archivo y decides si reemplazar las preguntas actuales o agregarlas. El servidor
(`POST /api/examenes/importar`) valida todo antes de guardar; si algo falla no se importa nada y
se listan los problemas por numero de pregunta. Maximo 100 preguntas por archivo.

Formato aceptado (un arreglo de preguntas, o un objeto con la clave `preguntas`):

```json
{
  "preguntas": [
    {
      "enunciado": "Cual es la funcion principal del lodo de perforacion?",
      "opciones": ["Enfriar y lubricar la barrena", "Generar electricidad", "Combustible", "Pintura"],
      "correcta": "a",
      "orden": 1
    }
  ]
}
```

- `enunciado` (obligatorio) &mdash; tambien vale `pregunta` o `texto`.
- Opciones: `opciones` (arreglo de **4**) o los campos sueltos `opcion_a`&hellip;`opcion_d` (o `a`&hellip;`d`).
- `correcta` (obligatorio): `"a"`&ndash;`"d"` o un numero `1`&ndash;`4`. Alias: `respuesta`, `respuesta_correcta`, `answer`.
- `orden` (opcional): si falta, se usa la posicion en el archivo.

Hay una plantilla lista para editar en `supabase/examen-ejemplo.json` (tambien se descarga desde el dialogo).

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
| `POST` | `/api/uploads` | Sube una imagen al bucket `portadas` y devuelve su URL publica (solo `admin` / `profesor`) |
| `POST` | `/api/examen` | Corrige el examen de un modulo en el servidor |
| `POST` | `/api/examenes/importar` | Importa preguntas de un modulo desde un JSON (solo `admin` / `profesor`) |

Tablas permitidas: `usuarios`, `cursos`, `modulos`, `temas`, `items`, `curso_profesores`, `inscripciones`, `preguntas`.
La escritura esta restringida por rol (`admin` total; `profesor` sobre modulos, temas, items y preguntas).

### Rate limiting (`src/middleware.ts`)

Todas las rutas `/api/*` pasan por un limitador por IP (ventana fija, en memoria, sin dependencias)
para frenar bots y fuerza bruta. Al superar el limite se responde **429** con cabeceras
`Retry-After` y `X-RateLimit-*`. Limites por defecto (ajustables en `REGLAS`):

| Prefijo | Limite |
| --- | --- |
| `/api/auth/*` | 20 solicitudes / 5 min |
| `/api/uploads` | 30 / 10 min |
| `/api/examen` | 40 / 10 min |
| resto de `/api/*` | 120 / min |

El conteo vive en la instancia; si el hosting escala a varias, cada una lleva el suyo (frena igual
a un bot desde una IP). Para un limite global exacto, cambiar el almacen por Upstash Redis / Vercel KV.
Se puede desactivar con `RATE_LIMIT_DESACTIVADO=1` (util en pruebas).

## Notas tecnicas

- Cero `var`: solo `const` / `let` con tipado estricto (`strict: true`).
- HTML semantico: `header`, `main`, `nav`, `section`, `article`, `aside`, `address`, `footer`.
- Contrasenas con `scrypt` (sal por usuario) y sesion en cookie httpOnly firmada.
- El canvas 3D se carga con `next/dynamic` y `ssr: false`.
