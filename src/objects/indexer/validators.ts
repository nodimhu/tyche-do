import { validateParams } from "../../common/durable-operation-object/helpers";

import { CreateIndexedIdParams } from "./params";

export function createIndexedIdValidator(params: CreateIndexedIdParams) {
  validateParams({
    itemName: !!params.itemName && typeof params.itemName === "string",
  });
}
