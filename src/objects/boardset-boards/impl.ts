import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import {
  RequireParams,
  ValidateParams,
} from "../../common/durable-operation-object/decorators";
import { fetchOperation } from "../../common/durable-operation-object/helpers";
import { hasOwnProperty } from "../../common/guards";
import {
  HttpConflictResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOKResponse,
} from "../../common/responses";

import { Board } from "../board";
import { createIndexedId } from "../indexer/helpers";
import { CreateBoardParams, DeleteBoardParams, GetBoardsParams } from "./params";
import { CreateBoardResult, GetBoardsResult } from "./results";
import { BoardsetBoardsData, DEFAULT_BOARDSET_BOARDS_DATA } from "./types";
import {
  createBoardValidator,
  deleteBoardValidator,
  getBoardsValidator,
} from "./validators";

// objName: <boardsetId> (from user-boardsets)
export class BoardsetBoards extends DurableDataOperationObject<BoardsetBoardsData>(
  DEFAULT_BOARDSET_BOARDS_DATA,
) {
  protected get binding(): DurableObjectNamespace {
    return this.env.BOARDSET_BOARDS;
  }

  async createNewBoardId(name: string): Promise<string> {
    return await createIndexedId(this.env, name, "board", true);
  }

  @Operation
  @ValidateParams(getBoardsValidator)
  async getBoards(params: GetBoardsParams): Promise<Response> {
    const boards = await this.getData("boards");

    if (params.year !== undefined) {
      return new HttpOKResponse({ [params.year]: boards[params.year] ?? [] });
    }

    return new HttpOKResponse<GetBoardsResult>(boards);
  }

  @Operation
  @RequireParams<CreateBoardParams>("year", "month")
  @ValidateParams(createBoardValidator)
  async createBoard(params: CreateBoardParams, name: string): Promise<Response> {
    const boards = await this.getData("boards");

    if (
      hasOwnProperty(boards, params.year.toString()) &&
      Object.values(boards[params.year]).find(
        (boardData) => boardData.month === params.month,
      )
    ) {
      return new HttpConflictResponse("Board Already Exists");
    }

    if (!hasOwnProperty(boards, params.year.toString())) {
      Object.assign(boards, { [params.year]: {} });
    }

    const newBoardId = await this.createNewBoardId(name);

    boards[params.year][newBoardId] = {
      month: params.month,
    };

    await this.setData({ boards });

    return new HttpOKResponse<CreateBoardResult>({
      [params.year]: boards[params.year] ?? [],
    });
  }

  @Operation
  @RequireParams<DeleteBoardParams>("boardId")
  @ValidateParams(deleteBoardValidator)
  async deleteBoard(params: DeleteBoardParams): Promise<Response> {
    const boards = await this.getData("boards");

    const [year, yearBoards] =
      Object.entries(boards).find(([_year, yearBoards]) =>
        Object.keys(yearBoards).find((boardId) => boardId === params.boardId),
      ) ?? [];

    if (!year || !yearBoards || !yearBoards[params.boardId]) {
      return new HttpNotFoundResponse();
    }

    // purge board data
    await fetchOperation<Board>(this.env.BOARD, params.boardId, "_purgeData");

    delete boards[year][params.boardId];

    if (Object.keys(boards[year]).length === 0) {
      delete boards[year];
    }

    await this.setData({ boards });

    return new HttpNoContentResponse();
  }

  @Operation
  async deleteAllBoards(params: never, name: string): Promise<Response> {
    const boards = await this.getData("boards");

    const allBoardIds = Object.values(boards).reduce(
      (prev, yearBoards) => prev.concat(Object.keys(yearBoards)),
      [] as string[],
    );

    if (allBoardIds.length === 0) {
      return new HttpNoContentResponse();
    }

    await Promise.all(
      allBoardIds.map((boardId) =>
        fetchOperation<BoardsetBoards, DeleteBoardParams>(
          this.binding,
          name,
          "deleteBoard",
          {
            boardId,
          },
        ),
      ),
    );

    await this.purgeData();

    return new HttpNoContentResponse();
  }
}
