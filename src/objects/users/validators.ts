import { validateParams } from "../../common/durable-operation-object/helpers";

import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  VerifyUserPasswordParams,
} from "./params";

export function createUserValidator(params: CreateUserParams) {
  validateParams({
    displayName:
      params.displayName === undefined || typeof params.displayName === "string",
    email: !!params.email && typeof params.email === "string",
    password: !!params.password && typeof params.password === "string",
    username: !!params.username && typeof params.username === "string",
  });
}

export function updateUserValidator(params: UpdateUserParams) {
  validateParams({
    username: !!params.username && typeof params.username === "string",
    user: !!params.user && typeof params.user === "object",
    "user.displayName":
      params.user.displayName === undefined ||
      typeof params.user.displayName === "string",
    "user.email":
      params.user.email === undefined || typeof params.user.email === "string",
    "user.password":
      params.user.password === undefined ||
      // !!params.user.password, so typeof null === "object" fails
      (!!params.user.password && typeof params.user.password === "object"),
    "user.password.current":
      params.user.password === undefined ||
      (!!params.user.password.current &&
        typeof params.user.password.current === "string"),
    "user.password.new":
      params.user.password === undefined ||
      (!!params.user.password.current && typeof params.user.password.new === "string"),
  });
}

export function getOrDeleteUserValidator(params: DeleteUserParams) {
  validateParams({
    username: !!params.username && typeof params.username === "string",
  });
}

export function verifyUserPasswordValidator(params: VerifyUserPasswordParams) {
  validateParams({
    password: !!params.password && typeof params.password === "string",
    username: !!params.username && typeof params.username === "string",
  });
}
