---
"@servicexjs/core": minor
"servicexjs": minor
---

Adopt JSON-RPC 2.0 protocol standard

- RPC request/response types now follow JSON-RPC 2.0 spec (jsonrpc, id fields)
- Add standard error codes (ErrorCodes) with JSON-RPC 2.0 integer codes
- Add DOMAIN_ERROR_CODE_MAP for mapping DomainError to JSON-RPC error codes
- Add ERROR_HTTP_STATUS_MAP for mapping error codes to HTTP status
- Add ServiceSchema/MethodSchema types for rpc.describe support
- Export JSONRPC_VERSION constant
