import { DurableOperationObject } from ".";
import { DurableDataObject } from "../durable-data-object";

export function DurableDataOperationObject<Data extends JSONObject>(
  defaultData: Data,
  lazyLoad = true,
) {
  return class extends DurableDataObject<Data> {
    protected LAZY_LOAD = lazyLoad;

    constructor(state: DurableObjectState, env: Env, defatultDataInner?: Data) {
      super(state, env, defatultDataInner ?? defaultData);

      const durableOperationObject = new DurableOperationObject(state, env);
      this.fetch = durableOperationObject.fetch.bind(this);
    }

    fetch: (request: Request) => Promise<Response>;
  };
}
