import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import { RequireParams } from "../../common/durable-operation-object/decorators";
import { fetchOperation } from "../../common/durable-operation-object/helpers";
import {
  HttpBadRequestResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOKResponse,
} from "../../common/responses";

import { createIndexedId } from "../indexer/helpers";
import {
  CreateBoardsetParams,
  DeleteBoardsetParams,
  GetBoardsetParams,
  UpdateBoardsetParams,
} from "./params";
import {
  CreateBoardsetResult,
  GetBoardsetResult,
  GetBoardsetsResult,
  UpdateBoardsetResult,
} from "./results";
import { BoardsetsData } from "./types";
import { validateCurrency } from "./utils";

// objName: <username>
export class UserBoardsets extends DurableDataOperationObject<BoardsetsData>({}) {
  protected get binding(): DurableObjectNamespace {
    return this.env.USER_BOARDSETS;
  }

  async createBoardsetId(namespace: string): Promise<string> {
    return await createIndexedId(this.env, namespace, "boardset", true);
  }

  @Operation
  async getBoardsets(): Promise<Response> {
    const boardsetsData = await this.getData();

    return new HttpOKResponse<GetBoardsetsResult>(boardsetsData);
  }

  @Operation
  @RequireParams<GetBoardsetParams>("boardsetId")
  async getBoardset(params: GetBoardsetParams): Promise<Response> {
    const boardset = await this.getData(params.boardsetId);

    if (!boardset) {
      return new HttpNotFoundResponse();
    }

    return new HttpOKResponse<GetBoardsetResult>(boardset);
  }

  @Operation
  @RequireParams<CreateBoardsetParams>("name")
  async createBoardset(params: CreateBoardsetParams, name: string): Promise<Response> {
    validateCurrency(params.currency);

    const newBoardsetId = await this.createBoardsetId(name);

    const newBoardset = {
      name: params.name,
      currency: params.currency,
    };

    await this.setData({ [newBoardsetId]: newBoardset });

    return new HttpOKResponse<CreateBoardsetResult>({ [newBoardsetId]: newBoardset });
  }

  @Operation
  @RequireParams<UpdateBoardsetParams>("boardsetId")
  async updateBoardset(params: UpdateBoardsetParams): Promise<Response> {
    const boardset = await this.getData(params.boardsetId);

    if (!boardset) {
      return new HttpNotFoundResponse();
    }

    validateCurrency(params.boardset.currency);

    if (params.boardset.name) {
      boardset.name = params.boardset.name;
    }

    if (params.boardset.currency) {
      boardset.currency = params.boardset.currency.toUpperCase();
    }

    if (params.boardset.currency === null) {
      boardset.currency = undefined;
    }

    await this.setData({ [params.boardsetId]: boardset });

    return new HttpOKResponse<UpdateBoardsetResult>(boardset);
  }

  @Operation
  @RequireParams<DeleteBoardsetParams>("boardsetId")
  async deleteBoardset(params: DeleteBoardsetParams): Promise<Response> {
    return new HttpBadRequestResponse("Operation Not Yet Implemented");

    const boardset = await this.getData(params.boardsetId);

    if (!boardset) {
      return new HttpNotFoundResponse();
    }

    // TODO: Delete all boards of boardset.
    // TODO: Delete boardset.

    return new HttpNoContentResponse();
  }
}
