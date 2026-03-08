import type { IWorldOptions } from "@deepracticex/bdd";
import { setWorldConstructor, World } from "@deepracticex/bdd";

export class ServiceXWorld extends World {
  // Domain
  generatedId?: string;
  generatedId2?: string;
  entity1?: any;
  entity2?: any;
  valueObject1?: any;
  valueObject2?: any;
  error?: Error;

  // Container
  container?: any;

  // Service builder
  runResult?: any;

  // HTTP
  response?: Response;
  responseBody?: any;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(ServiceXWorld);
