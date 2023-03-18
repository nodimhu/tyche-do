import { DurableDataObject } from "../durable-data-object";
import { JSONObject } from "../types";
import { DurableOperationObject } from "./impl";

export function DurableDataOperationObject<Data extends JSONObject>(
  defaultData: Data,
  lazyLoad = true,
) {
  const { fetch } = new DurableOperationObject();

  return class extends DurableDataObject<Data> {
    protected LAZY_LOAD = lazyLoad;
    fetch = fetch;

    constructor(state: DurableObjectState, env: Env, defatultDataInner?: Data) {
      super(state, env, defatultDataInner ?? defaultData);
    }
  };
}
