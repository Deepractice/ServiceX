import { eq } from "drizzle-orm";
import type { Entity } from "../domain/Entity";
import type { Repository } from "./index";

/**
 * Base class for Drizzle ORM repositories.
 *
 * Provides standard CRUD: save (upsert), findById, delete.
 * Subclasses define table + toEntity/toRow mappings.
 *
 * @example
 * ```ts
 * @injectable()
 * class TenantRepository
 *   extends DrizzleRepository<Tenant, typeof tenants>
 * {
 *   constructor(@inject("DB") db: DrizzleDB) {
 *     super(db, tenants);
 *   }
 *
 *   protected toEntity(row) {
 *     return Tenant.reconstitute(row.id, { name: row.name, ... });
 *   }
 *
 *   protected toRow(entity) {
 *     return { id: entity.id, name: entity.name, ... };
 *   }
 * }
 * ```
 */
export abstract class DrizzleRepository<
  TEntity extends Entity<string>,
  TTable extends { [key: string]: any },
> implements Repository<TEntity>
{
  constructor(
    protected readonly db: any,
    protected readonly table: TTable,
  ) {}

  protected abstract toEntity(row: any): TEntity;
  protected abstract toRow(entity: TEntity): any;

  protected toUpdateSet(entity: TEntity): Record<string, any> {
    const row = this.toRow(entity);
    const { id, ...rest } = row;
    return rest;
  }

  async findById(id: string): Promise<TEntity | null> {
    const row = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .get();
    return row ? this.toEntity(row) : null;
  }

  async save(entity: TEntity): Promise<void> {
    await this.db
      .insert(this.table)
      .values(this.toRow(entity))
      .onConflictDoUpdate({
        target: (this.table as any).id,
        set: this.toUpdateSet(entity),
      });
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(this.table)
      .where(eq((this.table as any).id, id));
  }
}
