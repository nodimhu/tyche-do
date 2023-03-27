import { isOperationRequestJSON } from "./common/durable-operation-object/guards";
import { fetchOperation } from "./common/durable-operation-object/helpers";
import { OperationRequestJSON } from "./common/durable-operation-object/types";
import {
  HttpBadRequestResponse,
  HttpNotFoundResponse,
  HttpUnauthorizedResponse,
} from "./common/responses";
import { JSONObject } from "./common/types";

declare global {
  interface Env {
    BOARD: DurableObjectNamespace;
    BOARDSET_BOARDS: DurableObjectNamespace;
    INDEXER: DurableObjectNamespace;
    USER_BOARDSETS: DurableObjectNamespace;
    USER_SETTINGS: DurableObjectNamespace;
    USERS: DurableObjectNamespace;
    ENVIRONMENT: string;
    AUTH_TOKEN?: string;
  }
}

export { Board } from "./objects/board";
export { BoardsetBoards } from "./objects/boardset-boards";
export { Indexer } from "./objects/indexer";
export { UserBoardsets } from "./objects/user-boardsets";
export { UserSettings } from "./objects/user-settings";
export { Users } from "./objects/users";

export default {
  async fetch(request: Request, env: Env) {
    const authHeader = request.headers.get("authorization");

    let authToken: string | undefined = undefined;

    if (authHeader?.startsWith("Bearer ")) {
      authToken = authHeader.slice(7).trim();
    }

    if (
      env.ENVIRONMENT !== "dev" &&
      (!authToken || !env.AUTH_TOKEN || authToken !== env.AUTH_TOKEN)
    ) {
      return new HttpUnauthorizedResponse();
    }

    const url = new URL(request.url);

    let name: string;
    let requestJSON: JSONObject;

    try {
      requestJSON = await request.json<OperationRequestJSON>();

      if (!isOperationRequestJSON(requestJSON)) {
        return new HttpBadRequestResponse("Not Operation Request");
      }

      name = requestJSON.name;
    } catch (error) {
      return new HttpBadRequestResponse("Malformed JSON");
    }

    let binding: DurableObjectNamespace;

    switch (url.pathname) {
      case "/board":
        binding = env.BOARD;
        break;
      case "/boardset-boards":
        binding = env.BOARDSET_BOARDS;
        break;
      case "/indexer":
        binding = env.INDEXER;
        break;
      case "/user-boardsets":
        binding = env.USER_BOARDSETS;
        break;
      case "/user-settings":
        binding = env.USER_SETTINGS;
        break;
      case "/users":
        if (name !== "root") {
          return new HttpBadRequestResponse("ID Not Root");
        }
        binding = env.USERS;
        break;
      default:
        return new HttpNotFoundResponse();
    }

    return await fetchOperation(
      binding,
      name,
      requestJSON.operation,
      requestJSON.parameters,
    );
  },
};
