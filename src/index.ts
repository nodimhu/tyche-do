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

    const objName = url.searchParams.get("objName");

    if (!objName) {
      return new HttpBadRequestResponse("Missing query parameters: objName");
    }

    switch (url.pathname) {
      case "/indexer": {
        const indexerId = env.INDEXER.idFromName(objName);
        const indexerStub = env.INDEXER.get(indexerId);
        return await indexerStub.fetch(request);
      }
      case "/user-boardsets": {
        const boardsetsId = env.USER_BOARDSETS.idFromName(objName);
        const boardsetsStub = env.USER_BOARDSETS.get(boardsetsId);
        return await boardsetsStub.fetch(request);
      }
      case "/users": {
        if (objName !== "root") {
          return new HttpBadRequestResponse("ObjName Not Root");
        }
        const usersId = env.USERS.idFromName("root");
        const usersStub = env.USERS.get(usersId);
        return await usersStub.fetch(request);
      }
      default:
        return new HttpNotFoundResponse();
    }
  },
};
