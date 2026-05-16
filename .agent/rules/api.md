# NestJS API patterns

- Feature-based modules: `src/<feature>/module.ts`, `controller.ts`, `service.ts`, `dto/`
- **Controllers** are thin — validation + serialisation only
- **Services** contain all business logic
- Use `@nestjs/config` with validated `ConfigService`
- `ValidationPipe` with `whitelist: true`, `transform: true`
- Expose DTOs via `@nestjs/swagger` decorators
- Throw `HttpException` subclasses from services
- Use ZodValidationPipe or `@nestjs/zod` for DTO validation at the controller boundary
- Consistent `ApiResponse<T>` envelope from all endpoints
- Paginate all list endpoints (cursor-based preferred)
- Use interceptors to wrap responses, exception filters for errors
