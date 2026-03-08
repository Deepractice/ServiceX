import { configure } from "@deepracticex/bdd";

await configure({
  features: ["bdd/features/**/*.feature"],
  steps: ["bdd/steps/**/*.steps.ts", "bdd/support/**/*.ts"],
});
