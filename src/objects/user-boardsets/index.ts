import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import {
  RequireParams,
  ValidateParams,
} from "../../common/durable-operation-object/decorators";
import { fetchOperation } from "../../common/durable-operation-object/helpers";
import {
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOKResponse,
} from "../../common/responses";

import { BoardsetBoards } from "../boardset-boards";
import { createIndexedId } from "../indexer/helpers";
import {
  createBoardsetValidator,
  deleteBoardsetValidator,
  getBoardsetValidator,
  updateBoardsetValidator,
} from "./validators";

// objName: <username>
export class UserBoardsets extends DurableDataOperationObject<TycheDO.UserBoardsets.BoardsetsData>(
  {},
) {
  protected get binding(): DurableObjectNamespace {
    return this.env.USER_BOARDSETS;
  }

  async createBoardsetId(namespace: string): Promise<string> {
    return await createIndexedId(this.env, namespace, "boardset", true);
  }

  @Operation
  async getBoardsets(): Promise<Response> {
    const boardsetsData = await this.getData();

    return new HttpOKResponse<TycheDO.UserBoardsets.GetBoardsetsResult>(boardsetsData);
  }

  @Operation
  @RequireParams<TycheDO.UserBoardsets.GetBoardsetParams>("boardsetId")
  @ValidateParams(getBoardsetValidator)
  async getBoardset(
    params: TycheDO.UserBoardsets.GetBoardsetParams,
  ): Promise<Response> {
    const boardset = await this.getData(params.boardsetId);

    if (!boardset) {
      return new HttpNotFoundResponse();
    }

    return new HttpOKResponse<TycheDO.UserBoardsets.GetBoardsetResult>(boardset);
  }

  @Operation
  @RequireParams<TycheDO.UserBoardsets.CreateBoardsetParams>("name")
  @ValidateParams(createBoardsetValidator)
  async createBoardset(
    params: TycheDO.UserBoardsets.CreateBoardsetParams,
    name: string,
  ): Promise<Response> {
    const newBoardsetId = await this.createBoardsetId(name);

    const newBoardset = {
      name: params.name,
      currency: params.currency,
    };

    await this.setData({ [newBoardsetId]: newBoardset });

    return new HttpOKResponse<TycheDO.UserBoardsets.CreateBoardsetResult>({
      [newBoardsetId]: newBoardset,
    });
  }

  @Operation
  @RequireParams<TycheDO.UserBoardsets.UpdateBoardsetParams>("boardsetId", "boardset")
  @ValidateParams(updateBoardsetValidator)
  async updateBoardset(
    params: TycheDO.UserBoardsets.UpdateBoardsetParams,
  ): Promise<Response> {
    const boardset = await this.getData(params.boardsetId);

    if (!boardset) {
      return new HttpNotFoundResponse();
    }

    if (params.boardset.name !== undefined) {
      boardset.name = params.boardset.name;
    }

    if (params.boardset.currency !== undefined) {
      boardset.currency = params.boardset.currency.toUpperCase();
    }

    if (params.boardset.currency === null) {
      boardset.currency = undefined;
    }

    await this.setData({ [params.boardsetId]: boardset });

    return new HttpOKResponse<TycheDO.UserBoardsets.UpdateBoardsetResult>(boardset);
  }

  @Operation
  @RequireParams<TycheDO.UserBoardsets.DeleteBoardsetParams>("boardsetId")
  @ValidateParams(deleteBoardsetValidator)
  async deleteBoardset(
    params: TycheDO.UserBoardsets.DeleteBoardsetParams,
  ): Promise<Response> {
    const boardset = await this.getData(params.boardsetId);

    if (!boardset) {
      return new HttpNotFoundResponse();
    }

    await fetchOperation<BoardsetBoards>(
      this.env.BOARDSET_BOARDS,
      params.boardsetId,
      "deleteAllBoards",
    );

    await this.setData({ [params.boardsetId]: undefined });

    return new HttpNoContentResponse();
  }

  @Operation
  async deleteAllBoardsets(params: never, name: string): Promise<Response> {
    const boardsets = await this.getData();

    const allBoardsetIds = Object.keys(boardsets);

    if (allBoardsetIds.length === 0) {
      return new HttpNoContentResponse();
    }

    await Promise.all(
      allBoardsetIds.map((boardsetId) =>
        fetchOperation<UserBoardsets, TycheDO.UserBoardsets.DeleteBoardsetParams>(
          this.binding,
          name,
          "deleteBoardset",
          {
            boardsetId,
          },
        ),
      ),
    );

    await this.purgeData();

    return new HttpNoContentResponse();
  }
}
