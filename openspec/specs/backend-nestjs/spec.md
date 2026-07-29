## ADDED Requirements

### Requirement: Modular NestJS Application Setup
The backend system SHALL run as a modular NestJS application with a global prefix `/api` and auto-generated Swagger documentation at `/api/docs`.

#### Scenario: Application Bootstrap
- **WHEN** the NestJS server starts
- **THEN** it listens on configured PORT, registers global ValidationPipe, and mounts Swagger docs at `/api/docs`

### Requirement: Prisma Service Integration
The system SHALL provide a global `PrismaService` that manages database connection lifecycles to PostgreSQL using the existing Prisma schema.

#### Scenario: Database connection on initialization
- **WHEN** NestJS application initializes
- **THEN** `PrismaService` connects to the PostgreSQL database using `DATABASE_URL`

### Requirement: JWT Authentication and Public Guard
The system SHALL secure all REST endpoints by default using a global `JwtAuthGuard`, allowing unauthenticated access only to routes marked with `@Public()`.

#### Scenario: Admin login
- **WHEN** an admin posts valid credentials to `/api/auth/login`
- **THEN** system responds with a signed JWT access token

#### Scenario: Unauthenticated request to protected route
- **WHEN** a request without a valid JWT token reaches `/api/children`
- **THEN** system responds with `401 Unauthorized`

### Requirement: Children Management and Avatar Uploads
The system SHALL manage child profiles and handle avatar uploads to object storage via `StorageService`.

#### Scenario: Create child with avatar
- **WHEN** an admin posts child details and avatar image to `/api/children`
- **THEN** file is uploaded to Garage/AWS S3 and child record is created with `avatarUrl`

#### Scenario: Point adjustment log
- **WHEN** an admin posts a point adjustment (`EARN`, `REDEEM`, `DEDUCT`) for a child
- **THEN** child's `totalPoints` is updated and a `PointLog` snapshot record is created

### Requirement: Activities and Rewards Management
The system SHALL provide CRUD endpoints for activities and rewards supporting soft deletes (`isDeleted`).

#### Scenario: Fetch active activities
- **WHEN** requesting GET `/api/activities`
- **THEN** system returns only non-deleted activities (`isDeleted: false`)
