export type GetBoardsParams = {
  year?: number;
};

export type CreateBoardParams = {
  year: number;
  month: number;
};

export type DeleteBoardParams = {
  boardId: string;
};
