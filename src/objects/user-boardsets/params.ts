import { Boardset } from "./types";

export type GetBoardsetParams = {
  boardsetId: string;
};

export type CreateBoardsetParams = {
  name: Boardset["name"];
} & Partial<Boardset>;

export type UpdateBoardsetParams = {
  boardsetId: string;
  boardset: Partial<Boardset>;
};

export type DeleteBoardsetParams = GetBoardsetParams;