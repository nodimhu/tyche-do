export type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [K: string]: JSONValue }
  | JSONValue[];

export type JSONObject = { [K: string]: JSONValue };
