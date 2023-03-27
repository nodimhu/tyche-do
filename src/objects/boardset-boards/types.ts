export type BoardData = {
  month: number;
};

export type BoardsetBoardsData = {
  boards: {
    [year: string]: {
      [boardId: string]: BoardData;
    };
  };
};

export const DEFAULT_BOARDSET_BOARDS_DATA: BoardsetBoardsData = {
  boards: {},
};
