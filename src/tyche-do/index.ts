export class TycheDO implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
    // `blockConcurrencyWhile()` ensures no requests are delivered until initialization completes
    this.state.blockConcurrencyWhile(async () => {
      // access storage here and initialize instance values
    });
  }

  async fetch(request: RequestInfo) {
    if (typeof request === "string") {
      return new Response("as string: " + new URL(request).pathname);
    }
    if (request instanceof Request) {
      return new Response("as Request: " + new URL(request.url).pathname);
    }
    if (request instanceof URL) {
      return new Response("as URL: " + request.pathname);
    }
    return new Response();
  }
}
