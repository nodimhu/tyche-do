import { validateParams } from "../../common/durable-operation-object/helpers";

export function getBoardsValidator(params: TycheDO.BoardsetBoards.GetBoardsParams) {
  validateParams({
    year:
      params.year === undefined ||
      (typeof params.year === "number" && params.year >= 1000 && params.year <= 9999),
  });
}

export function createBoardValidator(params: TycheDO.BoardsetBoards.CreateBoardParams) {
  validateParams({
    year: typeof params.year === "number" && params.year >= 1000 && params.year <= 9999,
    month: typeof params.month === "number" && params.month >= 1 && params.month <= 12,
  });
}

export function copyBoardValidator(params: TycheDO.BoardsetBoards.CopyBoardParams) {
  validateParams({
    boardId: !!params.boardId && typeof params.boardId === "string",
    year: typeof params.year === "number" && params.year >= 1000 && params.year <= 9999,
    month: typeof params.month === "number" && params.month >= 1 && params.month <= 12,
  });
}

export function getOrDeleteBoardValidator(
  params:
    | TycheDO.BoardsetBoards.GetBoardParams
    | TycheDO.BoardsetBoards.DeleteBoardParams,
) {
  validateParams({
    boardId: !!params.boardId && typeof params.boardId === "string",
  });
}
