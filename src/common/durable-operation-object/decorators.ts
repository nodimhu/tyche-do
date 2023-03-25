import { isFunction } from "../guards";
import { JSONObject } from "../types";
import { OperationParameterRequiredError } from "./errors";

export function Operation<
  InferredParameters extends JSONObject | void,
  InferredRequest extends Request | void,
  InferredResponse extends Response | Promise<Response> | void,
>(
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<
    (params: InferredParameters, request: InferredRequest) => InferredResponse
  >,
): TypedPropertyDescriptor<
  (params: InferredParameters, request: InferredRequest) => InferredResponse
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
    InferredRequest extends Request | void,
    InferredResponse extends Response | Promise<Response> | void,
  >(
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (params: ParamType, request: InferredRequest) => InferredResponse
    >,
  ): TypedPropertyDescriptor<
    (params: ParamType, request: InferredRequest) => InferredResponse
  > {
    const child = descriptor.value;

    if (!child) {
      return descriptor;
    }

    descriptor.value = function (
      params: ParamType,
      request: InferredRequest,
    ): InferredResponse {
      const requiredParamSet = new Set(requiredParameterKeys);
      Object.keys(params ?? {}).forEach((key) => requiredParamSet.delete(key));

      if (requiredParamSet.size > 0) {
        throw new OperationParameterRequiredError(
          Array.from(requiredParamSet).join(", "),
        );
      }

      return child.call(this, params, request);
    };

    return descriptor;
  };
}

// TODO: Keeping for future, but should not be needed as operations are built without
// bing concerned with search parameters (and this approach should be adhered to):

// export function RequireSearchParams<SearchParamKey extends string>(
//   ...searchParamKeys: SearchParamKey[]
// ) {
//   return function <
//     InferredParamType extends JSONObject | never,
//     InferredRequest extends Request,
//     InferredResponse extends Response | Promise<Response> | void,
//   >(
//     _target: object,
//     _key: string | symbol,
//     descriptor: TypedPropertyDescriptor<
//       (params: InferredParamType, request: InferredRequest) => InferredResponse
//     >,
//   ): TypedPropertyDescriptor<
//     (params: InferredParamType, request: InferredRequest) => InferredResponse
//   > {
//     const child = descriptor.value;

//     if (!child) {
//       return descriptor;
//     }

//     descriptor.value = function (
//       params: InferredParamType,
//       request: InferredRequest,
//     ): InferredResponse {
//       const requiredSearchParamSet: Set<string> = new Set(searchParamKeys);

//       const searchParams = new URL(request.url).searchParams.keys();

//       for (const searchParam of searchParams) {
//         requiredSearchParamSet.delete(searchParam);
//       }

//       if (requiredSearchParamSet.size > 0) {
//         throw new OperationSearchParameterRequiredError(
//           Array.from(requiredSearchParamSet).join(", "),
//         );
//       }

//       return child.call(this, params, request);
//     };

//     return descriptor;
//   };
// }
