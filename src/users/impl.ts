import {
  DurableDataOperationObject,
  Operation,
} from "../common/durable-operation-object";
import { Require } from "../common/durable-operation-object/decorators";
import {
  HttpConflictResponse,
  HttpNotFoundResponse,
  HttpOKResponse,
} from "../common/responses";

import { CreateParams, GetParams } from "./params";
import { UsersRecord } from "./types";
import { createPasswordHashData } from "./utils";

export class Users extends DurableDataOperationObject<UsersRecord>({}) {
  @Operation
  @Require("email", "username", "password")
  async create(params: CreateParams): Promise<Response> {
    const { displayName, email, password, username } = params;

    const existingUserData = await this.getData(username);

    if (existingUserData) {
      return new HttpConflictResponse("User Exists");
    }

    const newUserData = {
      [username]: {
        displayName: displayName ?? "",
        email,
        passwordHashData: createPasswordHashData(password),
      },
    };

    await this.setData(newUserData);

    return new HttpOKResponse(newUserData);
  }

  @Operation
  @Require("username")
  async get(params: GetParams): Promise<Response> {
    const userData = await this.getData(params.username);

    if (userData === undefined) {
      return new HttpNotFoundResponse();
    }

    return new Response(JSON.stringify(userData));
  }
}
