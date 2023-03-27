import { OperationError } from "../../common/durable-operation-object/errors";
import { fetchOperation } from "../../common/durable-operation-object/helpers";

import { Indexer } from "./impl";
import { CreateIndexedIdParams } from "./params";
import { CreateIndexedIdResult } from "./results";

export async function createIndexedId(
  env: Env,
  namespace: string,
  name: string,
  global?: boolean,
): Promise<string> {
  const createIndexedIdResponse = await fetchOperation<Indexer, CreateIndexedIdParams>(
    env.INDEXER,
    namespace,
    "createIndexedId",
    { itemName: name },
  );

  if (!createIndexedIdResponse.ok) {
    throw new OperationError("Indexer Error");
  }

  const { itemId } = await createIndexedIdResponse.json<CreateIndexedIdResult>();

  if (global) {
    return namespace + "-" + itemId;
  }

  return itemId;
}
