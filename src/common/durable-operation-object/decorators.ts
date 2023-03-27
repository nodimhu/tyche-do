import { isFunction } from "../guards";
import { JSONObject } from "../types";
import { OperationParameterRequiredError } from "./errors";

export function Operation<
  InferredParameters extends JSONObject | void,
  InferredName extends string | void,
  InferredResponse extends Response | Promise<Response> | void,
>(
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<
    (params: InferredParameters, name: InferredName) => InferredResponse
  >,
): TypedPropertyDescriptor<
  (params: InferredParameters, name: InferredName) => InferredResponse
> {
  if (isFunction(descriptor.value)) {
    Object.assign(descriptor.value, { isOperation: true });
  }
  return descriptor;
}

export function RequireParams<ParamType extends JSONObject>(
  ...requiredParameterKeys: (keyof ParamType)[]
) {
  return function <
    InferredName extends string | void,
    InferredResponse extends Response | Promise<Response> | void,
  >(
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (params: ParamType, name: InferredName) => InferredResponse
    >,
  ): TypedPropertyDescriptor<
    (params: ParamType, name: InferredName) => InferredResponse
  > {
    const child = descriptor.value;

    if (!child) {
      return descriptor;
    }

    descriptor.value = function (
      params: ParamType,
      name: InferredName,
    ): InferredResponse {
      const requiredParamSet = new Set(requiredParameterKeys);
      Object.keys(params ?? {}).forEach((key) => requiredParamSet.delete(key));

      if (requiredParamSet.size > 0) {
        throw new OperationParameterRequiredError(
          Array.from(requiredParamSet).join(", "),
        );
      }

      return child.call(this, params, name);
    };

    return descriptor;
  };
}
