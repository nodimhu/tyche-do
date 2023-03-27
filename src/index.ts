import {
  HttpBadRequestResponse,
  HttpNotFoundResponse,
  HttpUnauthorizedResponse,
} from "./common/responses";

declare global {
  interface Env {
    INDEXER: DurableObjectNamespace;
    USER_BOARDSETS: DurableObjectNamespace;
    USERS: DurableObjectNamespace;
    ENVIRONMENT: string;
    AUTH_TOKEN?: string;
  }
}

export { Indexer } from "./objects/indexer";
export { UserBoardsets } from "./objects/user-boardsets";
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
      case "/indexer":
        binding = env.INDEXER;
        break;
      case "/user-boardsets":
        binding = env.USER_BOARDSETS;
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
