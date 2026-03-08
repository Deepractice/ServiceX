/**
 * Class decorators for dependency injection.
 * Use these on service classes and repository implementations.
 *
 * @example
 * ```ts
 * @injectable()
 * class TenantService {
 *   constructor(@inject("TenantRepo") private repo: TenantRepository) {}
 * }
 * ```
 */
export { inject, injectable, singleton } from "tsyringe";
