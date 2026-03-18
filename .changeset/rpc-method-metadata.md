---
"servicexjs": minor
"@servicexjs/core": minor
"@servicexjs/node": minor
---

feat: RPC method metadata and /rpc/methods discovery endpoint

- Add `RpcMethodDefinition` with `description` and `permissions` fields
- Replace `publicMethods()` with inline `permissions: []` on method definitions
- Add `/rpc/methods` GET endpoint for method discovery (replaces `/schema`)
- Rename built-in RPC method from `rpc.describe` to `rpc.methods`
- `ServiceDefinition.methods` now uses `NormalizedRpcMethods` (always full definitions)

BREAKING CHANGE: `publicMethods()` builder method removed. Use `permissions: []` in method definition instead.
