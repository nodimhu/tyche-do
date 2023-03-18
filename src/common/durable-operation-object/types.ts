import { JSONObject } from "../types";

export interface IOperationRequest {
  operation: string;
  parameters?: Partial<JSONObject>;
}
