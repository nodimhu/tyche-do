import { validateParams } from "../../common/durable-operation-object/helpers";

import {
  CopyBoardParams,
  CreateBoardParams,
  DeleteBoardParams,
  GetBoardParams,
  GetBoardsParams,
} from "./params";

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

export function copyBoardValidator(params: CopyBoardParams) {
  validateParams({
    boardId: !!params.boardId && typeof params.boardId === "string",
    year: typeof params.year === "number" && params.year >= 1000 && params.year <= 9999,
    month: typeof params.month === "number" && params.month >= 1 && params.month <= 12,
  });
}

export function getOrDeleteBoardValidator(params: GetBoardParams | DeleteBoardParams) {
  validateParams({
    boardId: !!params.boardId && typeof params.boardId === "string",
  });
}
