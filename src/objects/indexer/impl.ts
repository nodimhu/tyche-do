import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import {
  RequireParams,
  ValidateParams,
} from "../../common/durable-operation-object/decorators";
import { HttpOKResponse } from "../../common/responses";

import { CreateIndexedIdParams } from "./params";
import { CreateIndexedIdResult } from "./results";
import { IndexerData } from "./types";
import { createIndexedIdValidator } from "./validators";

// objName: <any_name>  - acts as namespace, within which items can be indexed
export class Indexer extends DurableDataOperationObject<IndexerData>({}) {
  protected get binding(): DurableObjectNamespace {
    return this.env.INDEXER;
  }

  @Operation
  @RequireParams<CreateIndexedIdParams>("itemName")
  @ValidateParams(createIndexedIdValidator)
  async createIndexedId(params: CreateIndexedIdParams): Promise<Response> {
    const { counter: currentCounter } = (await this.getData(params.itemName)) ?? {
      counter: 0,
    };
    this.setData({ [params.itemName]: { counter: currentCounter + 1 } });

    return new HttpOKResponse<CreateIndexedIdResult>({
      itemId: params.itemName + "-" + currentCounter,
    });
  }
}
