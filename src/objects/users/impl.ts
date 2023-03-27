import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import { RequireParams } from "../../common/durable-operation-object/decorators";
import { makeOperationRequest } from "../../common/durable-operation-object/helpers";
import {
  HttpConflictResponse,
  HttpNotFoundResponse,
  HttpOKResponse,
  HttpUnauthorizedResponse,
} from "../../common/responses";

import { UserSettings } from "../user-settings";
import {
  CreateUserParams,
  GetUserParams,
  UpdateUserParams,
  VerifyUserPasswordParams,
} from "./params";
import { CreateUserResult, GetUserResult, UpdateUserResult } from "./results";
import { UsersData } from "./types";
import {
  createPasswordHashData,
  verifyPassword,
  withoutPasswordHashData,
} from "./utils";

// TODO: Research potential concurrency issues arrising from all users using the same
// "root" Users object. My be benefitial to implement concurrency config in
// DurableDataObject and allow concurrency in Users. The implementation must ensure
// potential race conditions only for a single user, which should be fine.

// objName: "root"
export class Users extends DurableDataOperationObject<UsersData>({}) {
  protected get binding(): DurableObjectNamespace {
    return this.env.USERS;
  }

  @Operation
  @RequireParams<GetUserParams>("username")
  async getUser(params: GetUserParams): Promise<Response> {
    const user = await this.getData(params.username);

    if (!user) {
      return new HttpNotFoundResponse();
    }

    return new HttpOKResponse<GetUserResult>(withoutPasswordHashData(user));
  }

  @Operation
  @RequireParams<CreateUserParams>("username", "password", "email")
  async createUser(params: CreateUserParams): Promise<Response> {
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

    return new HttpOKResponse<CreateUserResult>(withoutPasswordHashData(newUser));
  }

  @Operation
  @RequireParams<UpdateUserParams>("username", "user")
  async updateUser(params: UpdateUserParams): Promise<Response> {
    const user = await this.getData(params.username);

    if (!user) {
      return new HttpNotFoundResponse();
    }

    if (params.user.email) {
      user.email = params.user.email;
    }

    if (params.user.displayName) {
      user.displayName = params.user.displayName;
    }

    if (params.user.password) {
      if (!verifyPassword(params.user.password.current, user.passwordHashData)) {
        return new HttpUnauthorizedResponse();
      }

      user.passwordHashData = createPasswordHashData(params.user.password.new);
    }

    await this.setData({ [params.username]: user });

    return new HttpOKResponse<UpdateUserResult>(withoutPasswordHashData(user));
  }

  @Operation
  @RequireParams<VerifyUserPasswordParams>("username", "password")
  async verifyUserPassword(params: VerifyUserPasswordParams): Promise<Response> {
    const userInfo = await this.getData(params.username);

    if (!userInfo) {
      return new HttpNotFoundResponse();
    }

    if (!verifyPassword(params.password, userInfo.passwordHashData)) {
      return new HttpUnauthorizedResponse();
    }

    return new HttpOKResponse();
  }
}
