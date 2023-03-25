export type GetUserParams = {
  username: string;
};

export type CreateUserParams = {
  displayName?: string;
  email: string;
  password: string;
  username: string;
};

export type UpdateUserParams = {
  username: string;
  user: {
    displayName?: string;
    email?: string;
    password?: {
      current: string;
      new: string;
    };
  };
};

export type VerifyUserPasswordParams = {
  username: string;
  password: string;
};
