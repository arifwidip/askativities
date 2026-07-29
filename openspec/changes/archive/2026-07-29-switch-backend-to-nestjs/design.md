## Context

The backend currently runs on Express + TypeScript with custom authentication middleware, manual input validation, and route-based organization in `backend/src/routes`. While functional, NestJS provides better structural conventions, dependency injection, automatic Swagger API generation, and built-in integration for JWT guards and validation pipes.

We are implementing a side-by-side refactoring strategy, creating `backend-nestjs/` alongside existing code to allow side-by-side verification before full cutover.

## Goals / Non-Goals

**Goals:**
- Create a modular NestJS backend structure in `backend-nestjs/`.
- Reuse existing PostgreSQL schema and Prisma ORM configuration without database changes.
- Implement NestJS authentication with Passport JWT and global `JwtAuthGuard`.
- Implement `ChildrenModule`, `ActivitiesModule`, `RewardsModule`, and `StorageModule` (S3 avatar upload).
- Enforce strict input validation using `class-validator` DTOs.
- Provide auto-generated OpenAPI / Swagger documentation at `/api/docs`.

**Non-Goals:**
- Modifying the PostgreSQL database schema or existing data model.
- Rewriting the frontend client (frontend will point to standard `/api` endpoints).

## Decisions

### Decision 1: Keep Prisma ORM via a Custom `PrismaModule`
- **Choice**: Wrap Prisma Client inside a global NestJS `PrismaService` extending `PrismaClient` with `OnModuleInit` and `OnModuleDestroy` hooks.
- **Rationale**: Reuses `prisma/schema.prisma` and existing migrations directly without schema churn.
- **Alternatives Considered**: TypeORM (rejected due to necessity of migrating database schemas and seed scripts).

### Decision 2: Side-by-Side Application Layout (`backend-nestjs/`)
- **Choice**: Scaffold NestJS project in a dedicated folder or side-by-side structure (`backend-nestjs/` or structured migration).
- **Rationale**: Allows running existing Express app on Port 5000 and NestJS app on Port 5001 to verify parity step-by-step.

### Decision 3: NestJS Auth with JwtAuthGuard & `@Public()` Decorator
- **Choice**: Implement `AuthModule` using `@nestjs/jwt` and `@nestjs/passport`. Apply `JwtAuthGuard` globally via `APP_GUARD`, marking login endpoint with `@Public()`.
- **Rationale**: Eliminates manually attaching auth middleware to every route; secured by default.

### Decision 4: Object Storage via `StorageModule`
- **Choice**: Encapsulate AWS S3 / Garage S3 client within `StorageService` using `@aws-sdk/client-s3`.
- **Rationale**: Abstracts file uploading for child avatars cleanly into an injectable NestJS service.

## Risks / Trade-offs

- **[Risk]**: Differences in HTTP status codes or error response formats breaking frontend expectations.
  - **Mitigation**: Implement `HttpExceptionFilter` to format NestJS error responses consistently with expected JSON output.
- **[Risk]**: Multipart form data handling differences between Express Multer and NestJS FileInterceptor.
  - **Mitigation**: Use `@UseInterceptors(FileInterceptor('file'))` and `@UploadedFile()` to mirror avatar uploads.

## Migration Plan

1. Scaffold NestJS structure and dependencies in `backend-nestjs/`.
2. Connect `PrismaModule` and verify PostgreSQL connection with existing schema.
3. Implement `AuthModule` (JWT strategy, login controller, bcrypt hash comparison).
4. Implement `ChildrenModule`, `ActivitiesModule`, `RewardsModule`, and `StorageModule`.
5. Verify parity across all endpoints using Swagger (`/api/docs`) and integration tests.
6. Switch frontend target URL to point to NestJS backend on port 5000 / production host.
