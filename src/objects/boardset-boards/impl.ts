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
import {
  copyBoardValidator,
  createBoardValidator,
  getBoardsValidator,
  getOrDeleteBoardValidator,
} from "./validators";

const DEFAULT_BOARDSET_BOARDS_DATA: TycheDO.BoardsetBoards.BoardsetBoardsData = {
  boards: {},
};

// objName: <boardsetId> (from user-boardsets)
export class BoardsetBoards extends DurableDataOperationObject<TycheDO.BoardsetBoards.BoardsetBoardsData>(
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
  async getBoards(params: TycheDO.BoardsetBoards.GetBoardsParams): Promise<Response> {
    const boards = await this.getData("boards");

    if (params.year !== undefined) {
      return new HttpOKResponse<TycheDO.BoardsetBoards.GetBoardsResult>({
        [params.year]: boards[params.year] ?? [],
      });
    }

    return new HttpOKResponse<TycheDO.BoardsetBoards.GetBoardsResult>(boards);
  }

  @Operation
  @RequireParams<TycheDO.BoardsetBoards.GetBoardParams>("boardId")
  @ValidateParams(getOrDeleteBoardValidator)
  async getBoard(params: TycheDO.BoardsetBoards.GetBoardParams): Promise<Response> {
    const boards = await this.getData("boards");

    const [year, yearBoards] =
      Object.entries(boards).find(([_year, yearBoards]) =>
        Object.keys(yearBoards).find((boardId) => boardId === params.boardId),
      ) ?? [];

    if (!year || !yearBoards || !yearBoards[params.boardId]) {
      return new HttpNotFoundResponse();
    }

    return new HttpOKResponse<TycheDO.BoardsetBoards.GetBoardsResult>({
      [year]: { [params.boardId]: yearBoards[params.boardId] },
    });
  }

  @Operation
  @RequireParams<TycheDO.BoardsetBoards.CreateBoardParams>("year", "month")
  @ValidateParams(createBoardValidator)
  async createBoard(
    params: TycheDO.BoardsetBoards.CreateBoardParams,
    name: string,
  ): Promise<Response> {
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

    return new HttpOKResponse<TycheDO.BoardsetBoards.CreateBoardResult>({
      [params.year]: boards[params.year] ?? [],
    });
  }

  @Operation
  @RequireParams<TycheDO.BoardsetBoards.CopyBoardParams>("boardId", "year", "month")
  @ValidateParams(copyBoardValidator)
  async copyBoard(
    params: TycheDO.BoardsetBoards.CopyBoardParams,
    name: string,
  ): Promise<Response> {
    const createResponse = await fetchOperation<
      BoardsetBoards,
      TycheDO.BoardsetBoards.CreateBoardParams
    >(this.env.BOARDSET_BOARDS, name, "createBoard", {
      year: params.year,
      month: params.month,
    });

    if (!createResponse.ok) {
      return createResponse;
    }

    const sourceBoardId = params.boardId;

    const newBoardResult =
      await createResponse.json<TycheDO.BoardsetBoards.CreateBoardResult>();

    const [newBoardId] = Object.entries(newBoardResult[params.year]).find(
      ([_, board]) => board.month === params.month,
    ) ?? [undefined];

    if (!newBoardId) {
      throw new Error("Board creation failed");
    }

    const sourceBoardAccountsResponse = await fetchOperation<Board>(
      this.env.BOARD,
      sourceBoardId,
      "getAccounts",
    );

    if (!sourceBoardAccountsResponse.ok) {
      return sourceBoardAccountsResponse;
    }

    const sourceBoardTransactionsResponse = await fetchOperation<Board>(
      this.env.BOARD,
      sourceBoardId,
      "getTransactions",
    );

    if (!sourceBoardTransactionsResponse.ok) {
      return sourceBoardTransactionsResponse;
    }

    const sourceBoardParametersResponse = await fetchOperation<Board>(
      this.env.BOARD,
      sourceBoardId,
      "getParameters",
    );

    if (!sourceBoardParametersResponse) {
      return sourceBoardParametersResponse;
    }

    const sourceBoardAccounts =
      await sourceBoardAccountsResponse.json<TycheDO.Board.GetAccountsResult>();
    const sourceBoardTransactions =
      await sourceBoardTransactionsResponse.json<TycheDO.Board.GetTransactionsResult>();
    const sourceBoardParameters =
      await sourceBoardParametersResponse.json<TycheDO.Board.GetParametersResult>();

    for (const account of Object.values(sourceBoardAccounts)) {
      await fetchOperation<Board, TycheDO.Board.CreateAccountParams>(
        this.env.BOARD,
        newBoardId,
        "createAccount",
        { ...account, opening: account.closing },
      );
    }

    for (const transaction of Object.values(sourceBoardTransactions)) {
      if (transaction.cadence !== "recurring") {
        continue;
      }

      await fetchOperation<Board, TycheDO.Board.CreateTransactionParams>(
        this.env.BOARD,
        newBoardId,
        "createTransaction",
        {
          ...transaction,
          amount: transaction.type === "income" ? 0 : transaction.amount,
        },
      );
    }

    await fetchOperation<Board, TycheDO.Board.UpdateParametersParams>(
      this.env.BOARD,
      newBoardId,
      "updateParameters",
      { ...sourceBoardParameters },
    );

    return new HttpOKResponse<TycheDO.BoardsetBoards.CopyBoardResult>(newBoardResult);
  }

  @Operation
  @RequireParams<TycheDO.BoardsetBoards.DeleteBoardParams>("boardId")
  @ValidateParams(getOrDeleteBoardValidator)
  async deleteBoard(
    params: TycheDO.BoardsetBoards.DeleteBoardParams,
  ): Promise<Response> {
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
        fetchOperation<BoardsetBoards, TycheDO.BoardsetBoards.DeleteBoardParams>(
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
