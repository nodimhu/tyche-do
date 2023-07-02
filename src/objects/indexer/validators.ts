import { validateParams } from "../../common/durable-operation-object/helpers";

export function createIndexedIdValidator(
  params: TycheDO.Indexer.CreateIndexedIdParams,
) {
  validateParams({
    itemName: !!params.itemName && typeof params.itemName === "string",
  });
}
