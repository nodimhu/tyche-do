export type HashData = {
  hash: string;
  salt: string;
};

export type UsersRecord = {
  [username: string]: {
    displayName: string;
    email: string;
    passwordHashData: HashData;
  };
};
