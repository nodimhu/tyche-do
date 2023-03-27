import { validateParams } from "../../common/durable-operation-object/helpers";

import { CreateBoardParams, DeleteBoardParams, GetBoardsParams } from "./params";

export function getBoardsValidator(params: GetBoardsParams) {
  validateParams({
    year:
      params.year === undefined ||
      (typeof params.year === "number" && params.year >= 1000 && params.year <= 9999),
  });
}

export function createBoardValidator(params: CreateBoardParams) {
  validateParams({
    year: typeof params.year === "number" && params.year >= 1000 && params.year <= 9999,
    month: typeof params.month === "number" && params.month >= 1 && params.month <= 12,
  });
}

export function deleteBoardValidator(params: DeleteBoardParams) {
  validateParams({
    boardId: !!params.boardId && typeof params.boardId === "string",
  });
}
