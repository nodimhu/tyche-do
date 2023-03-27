import { fetchOperation } from "../../common/durable-operation-object/helpers";

import { Users } from "./impl";
import { GetUserParams } from "./params";

export async function getUserExists(
  username: string | null | undefined,
  env: Env,
): Promise<boolean> {
  if (!username) {
    return false;
  }

  const getUserResponse = await fetchOperation<Users, GetUserParams>(
    env.USERS,
    "root",
    "getUser",
    {
      username,
    },
  );

  if (!getUserResponse.ok) {
    return false;
  }

  return true;
}
