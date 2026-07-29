## 1. Project Initialization & Setup

- [x] 1.1 Initialize NestJS application structure in `backend-nestjs/` with TypeScript configuration
- [x] 1.2 Install NestJS core dependencies (`@nestjs/core`, `@nestjs/common`, `@nestjs/swagger`, `class-validator`, `class-transformer`)
- [x] 1.3 Configure global `ValidationPipe` and Swagger OpenAPI UI at `/api/docs` in `main.ts`

## 2. Database Integration (Prisma)

- [x] 2.1 Set up global `PrismaModule` and `PrismaService` connected to existing PostgreSQL schema
- [x] 2.2 Verify `PrismaService` lifecycle hooks (`onModuleInit`, `onModuleDestroy`) and database querying

## 3. Core Modules Implementation

- [x] 3.1 Implement `StorageModule` and `StorageService` using `@aws-sdk/client-s3` for object storage uploads
- [x] 3.2 Implement `AuthModule` with Passport JWT strategy, `JwtAuthGuard`, `@Public()` decorator, and admin login controller
- [x] 3.3 Implement `ChildrenModule` controller and service for child CRUD, point adjustment logs, and avatar file upload
- [x] 3.4 Implement `ActivitiesModule` controller and service for activity management and soft-delete filtering
- [x] 3.5 Implement `RewardsModule` controller and service for reward management and soft-delete filtering

## 4. Verification & Testing

- [x] 4.1 Verify all NestJS endpoints via Swagger documentation UI at `/api/docs`
- [x] 4.2 Validate API parity against existing Express backend functionality
