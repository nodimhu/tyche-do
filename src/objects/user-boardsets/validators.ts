import { validateParams } from "../../common/durable-operation-object/helpers";
import { isCurrency } from "../../common/utils";

import {
  CreateBoardsetParams,
  DeleteBoardsetParams,
  GetBoardsetParams,
  UpdateBoardsetParams,
} from "./params";

export function getBoardsetValidator(params: GetBoardsetParams) {
  validateParams({
    boardsetId: !!params.boardsetId && typeof params.boardsetId === "string",
  });
}

export function createBoardsetValidator(params: CreateBoardsetParams) {
  validateParams({
    name: !!params.name && typeof params.name === "string",
    currency:
      params.currency === undefined ||
      (!!params.currency &&
        typeof params.currency === "string" &&
        isCurrency(params.currency)),
  });
}

export function updateBoardsetValidator(params: UpdateBoardsetParams) {
  validateParams({
    boardsetId: !!params.boardsetId && typeof params.boardsetId === "string",
    boardset: !!params.boardset && typeof params.boardset === "object",
    "boardset.name":
      params.boardset?.name === undefined ||
      (!!params.boardset.name && typeof params.boardset.name === "string"),
    "boardset.currency":
      params.boardset?.currency === undefined ||
      params.boardset?.currency === null ||
      (!!params.boardset.currency &&
        typeof params.boardset.currency === "string" &&
        isCurrency(params.boardset.currency)),
  });
}

export function deleteBoardsetValidator(params: DeleteBoardsetParams) {
  validateParams({
    boardsetId: !!params.boardsetId && typeof params.boardsetId === "string",
  });
}
