import { validateParams } from "../../common/durable-operation-object/helpers";

export function createUserValidator(params: TycheDO.Users.CreateUserParams) {
  validateParams({
    displayName:
      params.displayName === undefined || typeof params.displayName === "string",
    email: !!params.email && typeof params.email === "string",
    password: !!params.password && typeof params.password === "string",
    username: !!params.username && typeof params.username === "string",
  });
}

export function updateUserValidator(params: TycheDO.Users.UpdateUserParams) {
  validateParams({
    username: !!params.username && typeof params.username === "string",
    user: !!params.user && typeof params.user === "object",
    "user.displayName":
      params.user.displayName === undefined ||
      typeof params.user.displayName === "string",
    "user.email":
      params.user.email === undefined || typeof params.user.email === "string",
    "user.password":
      params.user.password === undefined || typeof params.user.password === "string",
  });
}

export function getOrDeleteUserValidator(
  params: TycheDO.Users.GetUserParams | TycheDO.Users.DeleteUserParams,
) {
  validateParams({
    username: !!params.username && typeof params.username === "string",
  });
}

export function verifyUserPasswordValidator(
  params: TycheDO.Users.VerifyUserPasswordParams,
) {
  validateParams({
    password: !!params.password && typeof params.password === "string",
    username: !!params.username && typeof params.username === "string",
  });
}
