import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/domain/index.ts",
    "src/repository/index.ts",
    "src/rpc/index.ts",
    "src/event/index.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: true,
});
