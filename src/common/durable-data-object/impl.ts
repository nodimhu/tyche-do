import { JSONObject } from "../types";
import { DurableDataObjectMeta } from "./types";

export abstract class DurableDataObject<Data extends JSONObject>
  implements DurableObject
{
  protected LAZY_LOAD = true;

  protected state: DurableObjectState;
  protected env: Env;
  private data: Data;

  private loadedKeys: Set<keyof Data> | "all" = new Set();

  constructor(state: DurableObjectState, env: Env, private defaultData: Data) {
    this.state = state;
    this.env = env;
    this.data = { ...defaultData };

    if (!this.LAZY_LOAD) {
      this.state.blockConcurrencyWhile(async () => {
        await this.loadAllData();
        this.loadedKeys = "all";
      });
    }
  }

  private async loadKeyOverData(keys: (keyof Data)[]): Promise<void> {
    if (this.loadedKeys === "all") {
      return;
    }

    const keysToLoad = keys
      .map((key) => key.toString())
      .filter((key) => this.loadedKeys !== "all" && !this.loadedKeys.has(key));

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

  private async loadAllData(): Promise<void> {
    if (this.loadedKeys === "all") {
      return;
    }

    const allData = await this.state.storage.list();

    for (const [key, value] of allData.entries()) {
      if (value !== undefined) {
        Object.assign(this.data, { [key]: value });
      }
    }

    this.loadedKeys = "all";
  }

  async getMetaData(): Promise<DurableDataObjectMeta> {
    const hasStoredData = (await this.state.storage.list({ limit: 1 })).size > 0;
    return {
      hasStoredData,
    };
  }

  async getData(): Promise<Data>;
  async getData<K extends keyof Data>(key: K): Promise<Data[K]>;
  async getData<K extends (keyof Data)[]>(
    keys: K,
  ): Promise<{ [V in K[number]]: Data[V] }>;
  async getData<K extends keyof Data, I extends (keyof Data)[]>(
    keyOrKeys?: K | I,
  ): Promise<Data | Data[K] | { [V in I[number]]: Data[V] }> {
    if (!keyOrKeys) {
      await this.loadAllData();
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
    ) as {
      [V in (typeof keyOrKeys)[number]]: Data[V];
    };

    return queriedData;
  }

  async setData(partialData: Partial<Data>): Promise<void> {
    Object.assign(this.data, partialData);

    for (const [key, value] of Object.entries(partialData)) {
      if (value !== undefined) {
        await this.state.storage.put(key, value);
      } else {
        await this.state.storage.delete(key);
      }
      if (this.loadedKeys !== "all") {
        this.loadedKeys.add(key); // prevent reloading key with next get
      }
    }
  }

  async purgeData(): Promise<void> {
    await this.state.storage.deleteAll();
    this.data = this.defaultData;
    this.loadedKeys = "all";
  }

  abstract fetch(request: Request): Promise<Response>;
}
