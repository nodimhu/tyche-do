import { JSONObject } from "../types";

export abstract class DurableDataObject<Data extends JSONObject>
  implements DurableObject
{
  protected LAZY_LOAD = true;

  protected state: DurableObjectState;
  protected env: Env;
  private data: Data;

  private loadedKeys: Set<keyof Data> = new Set();

  constructor(state: DurableObjectState, env: Env, defaultData: Data) {
    this.state = state;
    this.env = env;
    this.data = defaultData;

    if (!this.LAZY_LOAD) {
      this.state.blockConcurrencyWhile(async () => {
        await this.loadKeyOverData(Object.keys(this.data));
      });
    }
  }

  private async loadKeyOverData(keys: (keyof Data)[]): Promise<void> {
    if (!this.LAZY_LOAD) {
      return; // already loaded all data in constructor
    }

    const keysToLoad = keys
      .map((key) => key.toString())
      .filter((key) => !this.loadedKeys.has(key));

    if (keysToLoad.length === 0) {
      return;
    }

    const storedData = await this.state.storage.get(keysToLoad);

    for (const [key, value] of storedData.entries()) {
      if (value !== undefined) {
        Object.assign(this.data, { [key]: value });
      }
      this.loadedKeys.add(key);
    }
  }

  async getData(): Promise<Data>;
  async getData<K extends keyof Data>(key: K): Promise<Data[K] | undefined>;
  async getData<K extends (keyof Data)[]>(
    keys: K,
  ): Promise<{ [V in K[number]]: Data[V] }>;
  async getData<K extends keyof Data, I extends (keyof Data)[]>(
    keyOrKeys?: K | I,
  ): Promise<Data | Data[K] | { [V in I[number]]: Data[V] } | undefined> {
    if (!keyOrKeys) {
      await this.loadKeyOverData(Object.keys(this.data));
      return this.data;
    }

    if (!Array.isArray(keyOrKeys)) {
      await this.loadKeyOverData([keyOrKeys]);
      return this.data[keyOrKeys];
    }

    const queriedKeys = new Set(keyOrKeys);

    await this.loadKeyOverData(Array.from(queriedKeys));

    const queriedData = Object.fromEntries(
      Object.entries(this.data).filter(([key]) => queriedKeys.has(key)),
    ) as { [V in (typeof keyOrKeys)[number]]: Data[V] };

    return queriedData;
  }

  async setData(partialData: Partial<Data>): Promise<void> {
    Object.assign(this.data, partialData);

    for (const [key, value] of Object.entries(partialData)) {
      await this.state.storage.put(key, value);
      if (this.LAZY_LOAD) {
        this.loadedKeys.add(key); // prevent reloading key with next get
      }
    }
  }

  abstract fetch(request: Request): Promise<Response>;
}
