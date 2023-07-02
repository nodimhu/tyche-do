import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import {
  RequireParams,
  ValidateParams,
} from "../../common/durable-operation-object/decorators";
import { fetchOperation } from "../../common/durable-operation-object/helpers";
import {
  HttpConflictResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOKResponse,
  HttpUnauthorizedResponse,
} from "../../common/responses";

import { UserBoardsets } from "../user-boardsets";
import { UserSettings } from "../user-settings";
import {
  createPasswordHashData,
  verifyPassword,
  withoutPasswordHashData,
} from "./utils";
import {
  createUserValidator,
  getOrDeleteUserValidator,
  updateUserValidator,
  verifyUserPasswordValidator,
} from "./validators";

// TODO: Research potential concurrency issues arrising from all users using the same
// "root" Users object. May be benefitial to implement concurrency config in
// DurableDataObject and allow concurrency in Users. The implementation must ensure
// potential race conditions only for a single user, which should be fine.

// objName: "root"
export class Users extends DurableDataOperationObject<TycheDO.Users.UsersData>({}) {
  protected get binding(): DurableObjectNamespace {
    return this.env.USERS;
  }

  @Operation
  @RequireParams<TycheDO.Users.GetUserParams>("username")
  @ValidateParams(getOrDeleteUserValidator)
  async getUser(params: TycheDO.Users.GetUserParams): Promise<Response> {
    const user = await this.getData(params.username);

    if (!user) {
      return new HttpNotFoundResponse();
    }

    return new HttpOKResponse<TycheDO.Users.GetUserResult>(
      withoutPasswordHashData(user),
    );
  }

  @Operation
  @RequireParams<TycheDO.Users.CreateUserParams>("username", "password", "email")
  @ValidateParams(createUserValidator)
  async createUser(params: TycheDO.Users.CreateUserParams): Promise<Response> {
    const existingUser = await this.getData(params.username);

    if (existingUser) {
      return new HttpConflictResponse("User Already Exists: " + params.username);
    }

    const newUser = {
      displayName: params.displayName ?? "",
      email: params.email,
      passwordHashData: createPasswordHashData(params.password),
    };

    await this.setData({ [params.username]: newUser });

    return new HttpOKResponse<TycheDO.Users.CreateUserResult>(
      withoutPasswordHashData(newUser),
    );
  }

  @Operation
  @RequireParams<TycheDO.Users.UpdateUserParams>("username", "user")
  @ValidateParams(updateUserValidator)
  async updateUser(params: TycheDO.Users.UpdateUserParams): Promise<Response> {
    const user = await this.getData(params.username);

    if (!user) {
      return new HttpNotFoundResponse();
    }

    if (params.user.email !== undefined) {
      user.email = params.user.email;
    }

    if (params.user.displayName !== undefined) {
      user.displayName = params.user.displayName;
    }

    if (params.user.password !== undefined) {
      user.passwordHashData = createPasswordHashData(params.user.password);
    }

    await this.setData({ [params.username]: user });

    return new HttpOKResponse<TycheDO.Users.UpdateUserResult>(
      withoutPasswordHashData(user),
    );
  }

  @Operation
  @RequireParams<TycheDO.Users.DeleteUserParams>("username")
  @ValidateParams(getOrDeleteUserValidator)
  async deleteUser(params: TycheDO.Users.DeleteUserParams): Promise<Response> {
    const user = await this.getData(params.username);

    if (!user) {
      return new HttpNotFoundResponse();
    }

    await fetchOperation<UserSettings>(
      this.env.USER_SETTINGS,
      params.username,
      "_purgeData",
    );
    await fetchOperation<UserBoardsets>(
      this.env.USER_BOARDSETS,
      params.username,
      "deleteAllBoardsets",
    );

    await this.setData({ [params.username]: undefined });

    return new HttpNoContentResponse();
  }

  @Operation
  @RequireParams<TycheDO.Users.VerifyUserPasswordParams>("username", "password")
  @ValidateParams(verifyUserPasswordValidator)
  async verifyUserPassword(
    params: TycheDO.Users.VerifyUserPasswordParams,
  ): Promise<Response> {
    const userInfo = await this.getData(params.username);

    if (!userInfo) {
      return new HttpNotFoundResponse();
    }

    if (!verifyPassword(params.password, userInfo.passwordHashData)) {
      return new HttpUnauthorizedResponse();
    }

    return new HttpNoContentResponse();
  }
}
