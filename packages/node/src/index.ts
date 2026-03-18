import type {
  AuthContext,
  RpcContext,
  RpcMethodDefinition,
  Runtime,
  ServiceDefinition,
  ServiceSchema,
} from "@servicexjs/core";
import { ServiceContainerImpl } from "@servicexjs/core";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwtVerify } from "jose";

/**
 * Node.js runtime configuration.
 */
export interface NodeConfig {
  /** Port to listen on. Default: 3000. */
  port?: number;
  /** Auth configuration. */
  auth?: {
    /** JWT secret string (for dev/test). */
    secret?: string;
    /** Cookie name for session token. Default: "session". */
    cookieName?: string;
  };
  /** Environment variables to inject. */
  env?: Record<string, unknown>;
  /** Base path for API routes. Default: "/api". */
  basePath?: string;
}

const ERROR_STATUS_MAP: Record<string, number> = {
  VALIDATION_ERROR: 400,
  AUTHENTICATION_ERROR: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

/**
 * Check if a method is public (no auth required).
 */
function isPublicMethod(method: RpcMethodDefinition): boolean {
  return Array.isArray(method.permissions) && method.permissions.length === 0;
}

/**
 * Build schema from service definition.
 */
function buildSchema(definition: ServiceDefinition): ServiceSchema {
  const methods = Object.entries(definition.methods).map(([name, def]) => ({
    name,
    ...(def.description && { description: def.description }),
    ...(def.permissions && { permissions: def.permissions }),
  }));

  return {
    name: definition.name,
    methods,
  };
}

/**
 * Create a Node.js runtime adapter for development and testing.
 *
 * @example
 * ```ts
 * import { createService } from "servicexjs";
 * import { node } from "@servicexjs/node";
 *
 * export default createService("tenant")
 *   .rpc({
 *     "tenant.create": {
 *       handler: async (params, ctx) => { ... },
 *       description: "Create a tenant",
 *     },
 *   })
 *   .register((ctx, env) => { ... })
 *   .run(node({
 *     port: 3000,
 *     auth: { secret: "dev-secret" },
 *     env: { DB: myDatabase },
 *   }));
 * ```
 */
export function node(config: NodeConfig = {}): Runtime<{ app: Hono; port: number }> {
  return {
    create(definition: ServiceDefinition) {
      const container = new ServiceContainerImpl();
      const secret = config.auth?.secret ?? "dev-secret";
      const cookieName = config.auth?.cookieName ?? "session";
      const basePath = config.basePath ?? "/api";
      const port = config.port ?? 3000;
      const env = config.env ?? {};

      const app = new Hono().basePath(basePath);
      app.use("*", cors());

      // Method discovery endpoint
      app.get("/rpc/methods", (c) => {
        return c.json(buildSchema(definition));
      });

      // RPC endpoint
      app.post("/rpc", async (c) => {
        container.initialize(definition.registerFn, env);

        let body: { method?: string; params?: Record<string, unknown> };
        try {
          body = await c.req.json();
        } catch {
          return c.json({ error: { code: "INVALID_REQUEST", message: "Invalid JSON body" } }, 400);
        }

        const { method, params = {} } = body;
        if (!method || typeof method !== "string") {
          return c.json(
            { error: { code: "INVALID_REQUEST", message: "Missing or invalid method" } },
            400
          );
        }

        // Built-in: rpc.methods
        if (method === "rpc.methods") {
          return c.json({ result: buildSchema(definition) });
        }

        const methodDef = definition.methods[method];
        if (!methodDef) {
          return c.json(
            { error: { code: "METHOD_NOT_FOUND", message: `Unknown method: ${method}` } },
            404
          );
        }

        // Auth
        let auth: AuthContext | null = null;

        if (!isPublicMethod(methodDef)) {
          const token = extractToken(c, cookieName);
          if (!token) {
            return c.json({ error: { code: "UNAUTHORIZED", message: "No token provided" } }, 401);
          }

          auth = await verifyToken(token, secret);
          if (!auth) {
            return c.json(
              { error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
              401
            );
          }
        }

        // Execute
        const ctx: RpcContext = {
          auth: auth as AuthContext,
          resolve: <T>(token: string) => container.resolve<T>(token),
          env,
        };

        try {
          const result = await methodDef.handler(params, ctx);
          return c.json({ result });
        } catch (err) {
          if (err instanceof Error && "code" in err && typeof (err as any).code === "string") {
            const code = (err as any).code as string;
            const status = ERROR_STATUS_MAP[code] || 500;
            return c.json({ error: { code, message: err.message } }, status as any);
          }
          const message = err instanceof Error ? err.message : "Internal error";
          return c.json({ error: { code: "INTERNAL_ERROR", message } }, 500);
        }
      });

      return { app, port };
    },
  };
}

// ---- Internal helpers ----

function extractToken(c: any, _cookieName: string): string | null {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

async function verifyToken(token: string, secret: string): Promise<AuthContext | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return {
      userId: payload.sub as string,
      tenantId: (payload.tenantId as string) || (payload.sub as string),
      email: payload.email as string,
      name: payload.name as string,
      avatarUrl: payload.avatarUrl as string | undefined,
    };
  } catch {
    return null;
  }
}
