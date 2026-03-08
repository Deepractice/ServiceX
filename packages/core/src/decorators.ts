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
export { injectable, inject, singleton } from "tsyringe";
