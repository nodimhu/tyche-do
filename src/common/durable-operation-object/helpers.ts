import { JSON_CONTENT_HEADER } from "../responses";
import { JSONObject } from "../types";
import { OperationParameterInvalidError } from "./errors";

export function validateParams(isValidParameter: Record<string, boolean>): void {
  const invalidParameters = Object.entries(isValidParameter).reduce(
    (prev, [name, isValid]) => (isValid ? prev : prev.concat(name)),
    [] as string[],
  );

  if (invalidParameters.length > 0) {
    throw new OperationParameterInvalidError(invalidParameters.join(", "));
  }
}

export async function fetchOperation<
  OperationObject extends DurableObject | unknown = unknown,
  ParamType extends JSONObject | unknown = unknown,
>(
  binding: DurableObjectNamespace,
  name: string,
  operation: keyof OperationObject,
  parameters?: ParamType,
  init: RequestInit<RequestInitCfProperties> = {},
): Promise<Response> {
  return await binding.get(binding.idFromName(name)).fetch(
    "https://.", // dummy URL
    {
      ...init,
      body: JSON.stringify({ name, operation, parameters }),
      method: "POST",
      headers: {
        ...init?.headers,
        ...JSON_CONTENT_HEADER,
      },
    },
  );
}
