import { JSON_CONTENT_HEADER } from "../responses";
import { JSONObject } from "../types";

export function makeOperationRequest<
  OperationObject extends DurableObject | Record<string, never> = Record<string, never>,
  ParamType extends JSONObject | undefined = undefined,
  InferredParamType extends ParamType = ParamType,
>(
  operation: keyof OperationObject,
  parameters?: InferredParamType,
  init: RequestInit<RequestInitCfProperties> = {},
): RequestInit<RequestInitCfProperties> {
  return {
    ...init,
    body: JSON.stringify({ operation, parameters }),
    method: "POST",
    headers: {
      ...init?.headers,
      ...JSON_CONTENT_HEADER,
    },
  };
}
