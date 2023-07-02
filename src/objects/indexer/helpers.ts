import { OperationError } from "../../common/durable-operation-object/errors";
import { fetchOperation } from "../../common/durable-operation-object/helpers";

import { Indexer } from "./impl";

export async function createIndexedId(
  env: Env,
  namespace: string,
  name: string,
  global?: boolean,
): Promise<string> {
  const createIndexedIdResponse = await fetchOperation<
    Indexer,
    TycheDO.Indexer.CreateIndexedIdParams
  >(env.INDEXER, namespace, "createIndexedId", { itemName: name });

  if (!createIndexedIdResponse.ok) {
    throw new OperationError("Indexer Error");
  }

  const { itemId } =
    await createIndexedIdResponse.json<TycheDO.Indexer.CreateIndexedIdResult>();

  if (global) {
    return namespace + "-" + itemId;
  }

  return itemId;
}
