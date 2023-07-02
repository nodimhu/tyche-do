import { validateParams } from "../../common/durable-operation-object/helpers";
import { isCurrency } from "../../common/utils";

export function getBoardsetValidator(params: TycheDO.UserBoardsets.GetBoardsetParams) {
  validateParams({
    boardsetId: !!params.boardsetId && typeof params.boardsetId === "string",
  });
}

export function createBoardsetValidator(
  params: TycheDO.UserBoardsets.CreateBoardsetParams,
) {
  validateParams({
    name: !!params.name && typeof params.name === "string",
    currency:
      params.currency === undefined ||
      (!!params.currency &&
        typeof params.currency === "string" &&
        isCurrency(params.currency)),
  });
}

export function updateBoardsetValidator(
  params: TycheDO.UserBoardsets.UpdateBoardsetParams,
) {
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

export function deleteBoardsetValidator(
  params: TycheDO.UserBoardsets.DeleteBoardsetParams,
) {
  validateParams({
    boardsetId: !!params.boardsetId && typeof params.boardsetId === "string",
  });
}
