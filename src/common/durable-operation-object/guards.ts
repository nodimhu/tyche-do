import { hasOwnProperty } from "../guards";
import { JSONValue } from "../types";
import { IOperationRequest } from "./types";

export function isOperationRequest<T extends JSONValue>(
  requestJson: T,
): requestJson is T & IOperationRequest {
  if (typeof requestJson !== "object") {
    return false;
  }

  const hasOperation = hasOwnProperty(requestJson, "operation");
  const hasParameters = hasOwnProperty(requestJson, "parameters");

  return (
    hasOperation &&
    typeof requestJson.operation === "string" &&
    (!hasParameters || typeof requestJson.parameters === "object")
  );
}
