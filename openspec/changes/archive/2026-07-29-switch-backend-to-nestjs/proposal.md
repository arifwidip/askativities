## Why

The current backend implementation uses Express.js with manual route handling, custom auth middleware, and un-standardized parameter validation. As the application grows, switching to NestJS provides a scalable, modular architecture with out-of-the-box dependency injection, declarative validation via DTOs (`class-validator`), unified JWT Guards, automated Swagger documentation, and cleaner separation of concerns.

To ensure zero downtime and safe verification, this migration will follow a side-by-side refactoring strategy, preserving the existing PostgreSQL schema and Prisma ORM logic while establishing standard NestJS conventions.

## What Changes

- **NEW**: Side-by-side NestJS application infrastructure in `backend-nestjs/` (or structured refactor) with global API prefix `/api` and auto-generated Swagger documentation at `/api/docs`.
- **NEW**: Global `PrismaModule` & `PrismaService` reusing existing Prisma schema and PostgreSQL database.
- **NEW**: NestJS `AuthModule` with `JwtModule`, `PassportModule`, `JwtAuthGuard`, and custom `@Public()` decorator replacing Express custom `authMiddleware`.
- **NEW**: NestJS `ChildrenModule` handling child CRUD, avatar file uploads via `StorageModule` (S3/Garage S3), and point balance transactions.
- **NEW**: NestJS `ActivitiesModule` and `RewardsModule` implementing soft-delete support and listing endpoints with DTO validation.
- **MODIFIED**: API routes standardizing on NestJS response structures and HTTP status codes.

## Capabilities

### New Capabilities
- `backend-nestjs`: Modular NestJS backend providing auth, children management, activities, rewards, and object storage services with standard NestJS patterns.

### Modified Capabilities
- None (Core business logic and Prisma database schemas remain consistent with existing specifications).

## Impact

- **Codebase**: New NestJS app structure with modular services, controllers, guards, and DTOs.
- **APIs**: Standardized REST endpoints under `/api`, exposed with Swagger OpenAPI specs.
- **Dependencies**: `@nestjs/core`, `@nestjs/common`, `@nestjs/swagger`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `class-validator`, `class-transformer`.
- **Database**: Zero schema alterations; reuses current Prisma PostgreSQL setup.
