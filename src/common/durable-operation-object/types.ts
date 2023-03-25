import { JSONObject } from "../types";

export type OperationRequestJSON<
  InferredParameters extends JSONObject | undefined = undefined,
> = {
  operation: string;
  parameters: InferredParameters;
};
