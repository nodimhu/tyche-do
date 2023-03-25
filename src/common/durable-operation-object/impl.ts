import { hasOwnProperty, isFunction } from "../guards";
import {
  HttpBadRequestResponse,
  HttpInternalServerErrorResponse,
  HttpMethodNotAllowedResponse,
  HttpNoContentResponse,
} from "../responses";
import { JSONValue } from "../types";
import { OperationError } from "./errors";
import { isOperationRequestJSON } from "./guards";

export class DurableOperationObject implements DurableObject {
  protected state: DurableObjectState;
  protected env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new HttpMethodNotAllowedResponse();
    }

    let requestJSON: JSONValue = undefined;

    try {
      requestJSON = await request.json<JSONValue>();
    } catch {
      return new HttpBadRequestResponse("Malformed JSON");
    }

    if (!isOperationRequestJSON(requestJSON)) {
      return new HttpBadRequestResponse("Not Operation Request");
    }

    const { operation, parameters } = requestJSON;

    const operationFunction = this[operation as keyof this];

    if (
      !isFunction(operationFunction) ||
      !hasOwnProperty(operationFunction, "isOperation") ||
      !operationFunction.isOperation
    ) {
      return new HttpBadRequestResponse("Invalid Operation");
    }

    let operationResult: unknown;
    let returnValue: unknown;

    try {
      operationResult = operationFunction.call(this, parameters ?? {}, request);

      if (operationResult instanceof Promise) {
        returnValue = await operationResult;
      } else {
        returnValue = operationResult;
      }
    } catch (error) {
      if (error instanceof OperationError) {
        return new HttpBadRequestResponse(error.message);
      }

      console.error(error);
      return new HttpInternalServerErrorResponse("Operation Error");
    }

    if (returnValue instanceof Response) {
      return returnValue;
    }

    return new HttpNoContentResponse();
  }
}
