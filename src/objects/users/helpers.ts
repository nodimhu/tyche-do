import { makeOperationRequest } from "../../common/durable-operation-object/helpers";

import { Users } from "./impl";
import { GetUserParams } from "./params";

export async function getUserExists(
  username: string | null | undefined,
  request: Request,
  env: Env,
): Promise<boolean> {
  if (!username) {
    return false;
  }

  const usersId = env.USERS.idFromName("root");
  const usersStub = env.USERS.get(usersId);

  const getUserResponse = await usersStub.fetch(
    request,
    makeOperationRequest<Users, GetUserParams>("getUser", { username }),
  );

  if (!getUserResponse.ok) {
    return false;
  }

  return true;
}
