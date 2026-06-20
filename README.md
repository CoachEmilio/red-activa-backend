# Red Activa — Backend API

> Sistema de identificación y seguimiento de personas en situación de vulnerabilidad, con matching semántico entre registros institucionales y reportes ciudadanos.

![Node.js](https://img.shields.io/badge/Node.js-20.19-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-9.x-880000?logo=mongoose&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![ESLint](https://img.shields.io/badge/Linting-ESLint-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Format-Prettier-F7B93E?logo=prettier&logoColor=black)

---

## Actualizaciones

**Recordar** este proyecto aun no está terminado para presentar esperando los ultimos cambios para el match de score en palabras que en comparacion tengan una coincidencia de por ejemplo un 75%, hasta ahora existe un algoritmo que cumple con el objetivo pero estamso buscando un opensource que sin cobro, logre dar con los resultados esperados.

## Índice

- [Descripción del proyecto](#descripción-del-proyecto)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Modelos de datos (MongoDB)](#modelos-de-datos-mongodb)
- [Endpoints de la API](#endpoints-de-la-api)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Colección Postman](#colección-postman)
- [Bitácora de commits](#bitácora-de-commits)
- [Rúbrica de evaluación](#rúbrica-de-evaluación)

---

## Descripción del proyecto

**Red Activa** es una API REST desarrollada para gestionar el registro de personas no identificadas en instituciones (hospitales, refugios, comisarías) y cruzar esos registros con reportes ciudadanos de personas desaparecidas. El sistema implementa un algoritmo de similitud compuesta (similitud de coseno sobre texto + score de género + score de edad) para sugerir posibles coincidencias automáticamente.

**Materia:** Ingeniería de Datos II — Datos No Relacionales  
**Profesor:** Moises Evaristo Bueno  Federico Humberto, Arenales
**Alumno:** Braian Botrera, Romero Quirino Luis Emilio, Di Pasquasio Federico, Manuel Zarrága, Agustin Diaz

---

## Arquitectura

```
red-activa-backend/
├── src/
│   ├── app.ts                  # Bootstrap Express, conexión MongoDB, seeders
│   ├── server.ts               # Entry point HTTP
│   ├── config/
│   │   ├── config.ts           # Variables de entorno centralizadas
│   │   └── multer.config.ts    # Configuración de upload de archivos
│   ├── controllers/            # Capa HTTP: parsea request, delega a service
│   │   ├── auth.controller.ts
│   │   ├── health.controller.ts
│   │   ├── institution.controller.ts
│   │   ├── person.controller.ts
│   │   └── upload.controller.ts
│   ├── services/               # Lógica de negocio
│   │   ├── analytics.service.ts      # Aggregation pipelines MongoDB
│   │   ├── auth.service.ts
│   │   ├── institution.service.ts
│   │   ├── person.service.ts
│   │   ├── report.service.ts
│   │   ├── similarity.service.ts     # Cosine similarity + scoring
│   │   ├── similarity-match.service.ts
│   │   └── upload.service.ts
│   ├── models/                 # Schemas Mongoose (colecciones MongoDB)
│   │   ├── institution.model.ts
│   │   ├── neighborhood.model.ts
│   │   ├── person.model.ts
│   │   ├── report.model.ts
│   │   ├── seeder-log.model.ts
│   │   ├── similarity-match.model.ts
│   │   └── user.model.ts
│   ├── routes/                 # Definición de rutas Express
│   ├── middlewares/
│   │   └── jwt.middleware.ts   # Autenticación JWT
│   ├── seeders/                # Datos iniciales cargados al arrancar
│   ├── enums/                  # Tipos constantes (Gender, Status, etc.)
│   ├── lib/                    # Utilidades internas (logger, errores, response)
│   ├── types/                  # Interfaces TypeScript
│   └── utils/                  # Helpers generales
├── docker-compose.yml          # MongoDB 7 en contenedor
├── .env.example                # Template de variables de entorno
├── nodemon.json                # Hot-reload en desarrollo
├── tsconfig.json
└── package.json
```

**Patrón arquitectónico:** Layered (Controller → Service → Model)

**Flujo de una request:**
```
Cliente HTTP
    └─> Express Router
          └─> JWT Middleware (validación de token)
                └─> Controller (parseo de request)
                      └─> Service (lógica + queries MongoDB)
                            └─> Mongoose Model
                                  └─> MongoDB 7
```

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 20.19 | Runtime |
| TypeScript | 5.6 | Lenguaje |
| Express | 4.x | Framework HTTP |
| MongoDB | 7 | Base de datos (no relacional) |
| Mongoose | 9.x | ODM / schemas |
| JWT | — | Autenticación stateless |
| Multer | 2.x | Upload de imágenes |
| Pino | 7.x | Logging estructurado |
| Helmet | 5.x | Headers de seguridad HTTP |
| Morgan | — | HTTP request logger |
| Docker Compose | — | Contenedor MongoDB local |
| ESLint + Prettier | — | Calidad de código |
| Nodemon | — | Hot-reload en desarrollo |

---

## Modelos de datos (MongoDB)

### `Person` — Persona no identificada

| Campo | Tipo | Descripción |
|---|---|---|
| `estimatedAgeMin / Max` | Number | Rango etario estimado |
| `gender` | Enum | `MALE`, `FEMALE`, `OTHER` |
| `height / weight` | Number | Medidas físicas opcionales |
| `distinctiveFeatures` | String | Descripción textual para matching |
| `consciousnessLevel` | Enum | Estado de consciencia al ingreso |
| `address / neighborhood` | String | Lugar donde fue encontrada |
| `geoLocation` | GeoJSON Point | Coordenadas para índice 2dsphere |
| `institution` | ObjectId → Institution | Institución que la aloja |
| `status` | Enum | `UNIDENTIFIED`, `IDENTIFIED`, etc. |
| `identifyingPhotos` | Array de objetos | Fotos con URL y caption |
| `createdBy` | ObjectId → User | Usuario que registró |
| `deletedAt` | Date | Soft delete |

**Índices:** `geoLocation` (2dsphere), `neighborhood`, `status`, `gender`, `{institution, status}`, `deletedAt`

---

### `Report` — Reporte ciudadano de persona desaparecida

| Campo | Tipo | Descripción |
|---|---|---|
| `fullName` | String | Nombre completo |
| `description` | String | Descripción libre |
| `picture` | String | URL de imagen |
| `neighborhood` | String | Barrio donde fue visto por última vez |
| `lastSeenDate` | Date | Fecha de último avistamiento |
| `gender / estimatedAge / height / weight` | Mixed | Datos físicos opcionales |
| `deletedAt` | Date | Soft delete |

**Índices:** text sobre `{description, fullName}`, `neighborhood`, `gender`, `estimatedAge`, `deletedAt`

---

### `Institution` — Institución receptora

| Campo | Tipo | Descripción |
|---|---|---|
| `name / type / address / phone` | String | Datos de contacto |
| `neighborhood` | String | Barrio |
| `location` | GeoJSON Point | Geolocalización |
| `deletedAt` | Date | Soft delete |

**Índices:** `location` (2dsphere), `neighborhood`, `deletedAt`

---

### `SimilarityMatch` — Cruce persona–reporte

| Campo | Tipo | Descripción |
|---|---|---|
| `person` | ObjectId → Person | Referencia a persona |
| `report` | ObjectId → Report | Referencia a reporte |
| `score` | Number | Score compuesto 0–1 |
| `breakdown.text` | Number | Score de similitud de coseno |
| `breakdown.gender` | Number / null | Score de coincidencia de género |
| `breakdown.age` | Number / null | Score de proximidad de edad |
| `matches` | String[] | Tokens coincidentes entre documentos |

**Índices:** `{person, report}` (unique), `{person, score}`, `{report, score}`

---

### `User`, `Neighborhood`, `SeederLog`

Colecciones de soporte para autenticación, catalogación geográfica y control de idempotencia de seeders.

---

## Endpoints de la API

Base URL: `http://localhost:3001/api`

Todos los endpoints (excepto `/health` y `/auth`) requieren header:
```
Authorization: Bearer <token>
```

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Login, retorna JWT |
| `POST` | `/auth/register` | Registro de usuario |

### Health
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Liveness check |

### Persons
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/persons` | Listar personas no identificadas |
| `POST` | `/persons` | Registrar persona (con imágenes) |
| `GET` | `/persons/:id` | Detalle de persona |
| `PUT` | `/persons/:id` | Actualizar persona |
| `DELETE` | `/persons/:id` | Eliminar (soft delete) |
| `POST` | `/persons/:id/photos` | Agregar fotos identificatorias |
| `GET` | `/persons/:id/similarities` | Ver cruces de similitud |

### Reports
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/reports` | Listar reportes ciudadanos |
| `GET` | `/reports/:id` | Detalle de reporte |
| `GET` | `/reports/:id/similarities` | Ver cruces de similitud |

### Institutions
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/institutions` | Listar instituciones |
| `POST` | `/institutions` | Crear institución |
| `GET` | `/institutions/:id` | Detalle |
| `PUT` | `/institutions/:id` | Actualizar |
| `DELETE` | `/institutions/:id` | Eliminar (soft delete) |

### Upload
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/upload` | Subir archivo, retorna URL |

### Analytics
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/analytics/by-neighborhood` | NN y reportes agrupados por barrio |
| `GET` | `/analytics/heatmap` | Datos para heatmap geográfico por institución |
| `GET` | `/analytics/summary` | Totales globales, por estado, género y matches |

---

## Cómo correr el proyecto

### Requisitos previos

- [Node.js 20.19](https://nodejs.org/) (se recomienda usar [nvm](https://github.com/nvm-sh/nvm))
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (para MongoDB)

### Pasos

**1. Clonar el repositorio**
```bash
git clone <url-del-repo>
cd red-activa-backend
```

**2. Usar la versión correcta de Node**
```bash
nvm use   # usa la versión del archivo .nvmrc (20.19)
```

**3. Instalar dependencias**
```bash
yarn install
```

**4. Levantar MongoDB con Docker**
```bash
docker compose up -d
```
Esto levanta MongoDB 7 en `localhost:27017` con usuario `admin` / contraseña `admin123`.

**5. Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env si es necesario (el default funciona con el docker-compose incluido)
```

**6. Correr en modo desarrollo**
```bash
yarn dev
```

Al arrancar, la aplicación:
- Se conecta a MongoDB
- Ejecuta seeders automáticamente (instituciones, barrios, usuarios, personas, reportes)
- Queda escuchando en `http://localhost:3001`

**7. Build para producción**
```bash
yarn build    # compila TypeScript a dist/
yarn start    # corre el build compilado
```

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `yarn dev` | Servidor con hot-reload (nodemon) |
| `yarn build` | Compilar TypeScript |
| `yarn start` | Correr build de producción |
| `yarn deploy` | Build + migrate + start |

---

## Variables de entorno

| Variable | Ejemplo | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto del servidor HTTP |
| `ENV` | `LOCAL` | Entorno (`LOCAL`, `DEV`, `QA`, `PROD`) |
| `MONGO_URL` | `mongodb://user:pass@localhost:27017/red_activa?authSource=admin` | Conexión a MongoDB |
| `JWT_SECRET` | `your_jwt_secret_here` | Clave para firmar tokens JWT |
| `JWT_EXPIRES_IN` | `8h` | Tiempo de expiración del token |
| `LOG_LEVEL` | `trace` | Nivel de log de Pino |
| `APP_URL` | `http://localhost:3001` | Base URL para generar URLs de archivos |

---

## Colección Postman

El archivo `red-activa.postman_collection.json` en la raíz del proyecto contiene todos los endpoints pre-configurados listos para importar en Postman o Insomnia.

---

## Bitácora de commits

Historial de trabajo del equipo en este repositorio:

| # | Hash | Fecha | Descripción |
|---|---|---|---|
| 7 | `ae0046a` | 2026-06-19 | change come services |
| 6 | `80cd35b` | 2026-06-10 | added reports |
| 5 | `95f5c51` | 2026-06-04 | fix types in person |
| 4 | `1a162dc` | 2026-06-03 | Added env sample |
| 3 | `04d059d` | 2026-06-03 | updated person endpoint and create postman json |
| 2 | `7473680` | 2026-06-03 | Change types, create new endpoints |
| 1 | `bba4505` | 2026-06-02 | first commit |

**Autor:** Braian Botrera (`botrera`)

**Resumen de evolución:**
- **02/06** — Estructura inicial del proyecto (Express + MongoDB + TypeScript)
- **03/06** — Definición de tipos, endpoints principales de personas e instituciones, colección Postman
- **04/06** — Corrección de tipos en el modelo Person
- **10/06** — Incorporación del módulo de reportes ciudadanos y algoritmo de similitud
- **19/06** — Refactor de servicios (analytics, similarity-match)

---

## Rúbrica de evaluación

### Parcial 2 — Implementación y Validación (30%)

> **Enfoque:** ejecución + consistencia + evolución

| Item | Criterio | Peso | Insuficiente (1) | Aceptable (2) | Bueno (3) | Excelente (4) | Calif. |
|---|---|---|---|---|---|---|---|
| 5 | Implementación técnica | 9,0% | Incompleta o no funcional | Funciona parcialmente | Funcional y consistente | Robusta, completa y bien estructurada | |
| 6 | Pipeline de datos (E2E) | 6,0% | Flujo incompleto o incorrecto | Pipeline básico con fallas | Pipeline completo funcional | Pipeline integrado, automatizado y eficiente | |
| 7 | Calidad y performance | 5,0% | Bajo rendimiento | Rendimiento aceptable | Buen rendimiento | Optimización evidente y buenas prácticas | |
| 8 | Ajustes sobre diseño original | 5,0% | No hay ajustes ni justificación | Cambios sin justificar | Ajustes coherentes | Mejora clara con justificación técnica (trade-offs) | |
| 9 | Documentación técnica | 5,0% | Ausente o confusa | Incompleta | Clara y suficiente | Detallada, estructurada y profesional | |
| | | **30,0%** | | | | | **0** |

---

### Entrega Final + Defensa (45%)

> **Enfoque:** producto final + comprensión + trabajo en equipo

| Item | Criterio | Peso | Insuficiente (1) | Aceptable (2) | Bueno (3) | Excelente (4) | Calif. |
|---|---|---|---|---|---|---|---|
| 10 | Producto final | 15,0% | No cumple objetivos | Cumple parcialmente | Cumple objetivos | Supera objetivos y es consistente | |
| 11 | Arquitectura final | 5,0% | Inconsistente o incorrecta | Básica | Adecuada | Robusta, escalable y bien fundamentada | |
| 12 | Calidad global | 5,0% | Malas prácticas | Aceptable | Buenas prácticas | Muy buenas prácticas y calidad técnica | |
| 13 | Documentación final | 5,0% | Deficiente | Básica | Clara | Completa, profesional y reutilizable | |
| 14 | Innovación y valor agregado | 5,0% | Sin aporte | Aporte mínimo | Interesante | Solución innovadora y creativa | |
| 15 | Trabajo en equipo | 5,0% | Desorganización | Organización básica | Buena colaboración | Excelente coordinación y uso de herramientas | |
| 16 | Defensa individual | 5,0% | No comprende el sistema | Comprensión parcial | Explica correctamente | Domina el sistema y justifica decisiones | |
| | | **45,0%** | | | | | **0** |
