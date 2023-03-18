import { isFunction } from "../guards";
import { JSONObject } from "../types";
import { OperationParameterRequiredError } from "./errors";

export function Operation<
  P extends JSONObject | void,
  R extends Response | Promise<Response> | void,
>(
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<(params: P) => R>,
): TypedPropertyDescriptor<(params: P) => R> {
  if (isFunction(descriptor.value)) {
    Object.assign(descriptor.value, { isOperation: true });
  }
  return descriptor;
}

export function Require<T extends string[]>(...requiredParameterKeys: T) {
  return function <
    P extends JSONObject | void,
    R extends Response | Promise<Response> | void,
  >(
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<(params: P) => R>,
  ): TypedPropertyDescriptor<(params: P) => R> {
    const child = descriptor.value;

    if (!child) {
      return descriptor;
    }

    descriptor.value = function (params: P): R {
      const requiredParameterSet = new Set(requiredParameterKeys);
      Object.keys(params ?? {}).forEach((key) => requiredParameterSet.delete(key));

      if (requiredParameterSet.size > 0) {
        throw new OperationParameterRequiredError(
          "Missing Parameters: " + Array.from(requiredParameterSet).join(", "),
        );
      }

      return child.call(this, params);
    };

    return descriptor;
  };
}
