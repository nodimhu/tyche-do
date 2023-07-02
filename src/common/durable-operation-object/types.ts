export type OperationRequestJSON<
  InferredParameters extends JSONObject | undefined = undefined,
> = {
  name: string;
  operation: string;
  parameters: InferredParameters;
};
