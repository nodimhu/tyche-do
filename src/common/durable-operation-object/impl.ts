import { hasOwnProperty, isFunction } from "../guards";
import {
  HttpBadRequestResponse,
  HttpInternalServerErrorResponse,
  HttpMethodNotAllowedResponse,
  HttpNoContentResponse,
} from "../responses";
import { JSONValue } from "../types";
import { OperationParameterRequiredError } from "./errors";
import { isOperationRequest } from "./guards";

export class DurableOperationObject implements DurableObject {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new HttpMethodNotAllowedResponse();
    }

    let requestJson: JSONValue = undefined;

    try {
      requestJson = await request.json<JSONValue>();
    } catch {
      return new HttpBadRequestResponse("Malformed JSON");
    }

    if (!isOperationRequest(requestJson)) {
      return new HttpBadRequestResponse("Not Operation Request");
    }

    const { operation, parameters } = requestJson;

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
      operationResult = operationFunction.call(this, parameters ?? {});

      if (operationResult instanceof Promise) {
        returnValue = await operationResult;
      } else {
        returnValue = operationResult;
      }
    } catch (error) {
      if (error instanceof OperationParameterRequiredError) {
        return new HttpBadRequestResponse(error.message);
      }
      return new HttpInternalServerErrorResponse("Operation Error");
    }

    if (returnValue instanceof Response) {
      return returnValue;
    }

    return new HttpNoContentResponse();
  }
}
