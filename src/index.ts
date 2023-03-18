import { HttpNotFoundResponse, HttpUnauthorizedResponse } from "./common/responses";

declare global {
  interface Env {
    USERS: DurableObjectNamespace;
    ENVIRONMENT: string;
    AUTH_TOKEN?: string;
  }
}

export { Users } from "./users";

export default {
  async fetch(request: Request, env: Env) {
    const authHeader = request.headers.get("authorization");

    let authToken: string | undefined = undefined;

    if (authHeader?.startsWith("Bearer ")) {
      authToken = authHeader.slice(7).trim();
    }

    if (
      env.ENVIRONMENT !== "dev" &&
      (!authToken ||
        authToken.length === 0 ||
        !env.AUTH_TOKEN ||
        env.AUTH_TOKEN.length === 0 ||
        authToken !== env.AUTH_TOKEN)
    ) {
      return new HttpUnauthorizedResponse();
    }

    const url = new URL(request.url);

    switch (url.pathname) {
      case "/users":
        const usersId = env.USERS.idFromName("root");
        const usersStub = env.USERS.get(usersId);
        return await usersStub.fetch(request);
      default:
        return new HttpNotFoundResponse();
    }
  },
};
