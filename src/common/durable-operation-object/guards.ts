import { hasOwnProperty } from "../guards";
import { JSONValue } from "../types";
import { OperationRequestJSON } from "./types";

export function isOperationRequestJSON<InferredRequestJson extends JSONValue>(
  requestJSON: InferredRequestJson,
): requestJSON is InferredRequestJson & OperationRequestJSON {
  if (typeof requestJSON !== "object") {
    return false;
  }

  const hasName = hasOwnProperty(requestJSON, "name");
  const hasOperation = hasOwnProperty(requestJSON, "operation");
  const hasParameters = hasOwnProperty(requestJSON, "parameters");

  return (
    hasName &&
    typeof requestJSON.name === "string" &&
    hasOperation &&
    typeof requestJSON.operation === "string" &&
    (!hasParameters || typeof requestJSON.parameters === "object")
  );
}
