export const JSON_CONTENT_HEADER = { "content-type": "application/json" };

export class HttpOKResponse extends Response {
  constructor(body?: object | string, init: ResponseInit = {}) {
    super(body && JSON.stringify(body), {
      ...init,
      status: 200,
      headers: { ...init.headers, ...JSON_CONTENT_HEADER },
    });
  }
}

export class HttpNoContentResponse extends Response {
  constructor() {
    super(null, {
      status: 204,
      headers: { "content-length": "0", ...JSON_CONTENT_HEADER },
    });
  }
}

export class HttpBadRequestResponse extends Response {
  constructor(
    body: object | string | undefined = "Bad Request",
    init: ResponseInit = {},
  ) {
    super(body && JSON.stringify(body), {
      ...init,
      status: 400,
      headers: { ...init.headers, ...JSON_CONTENT_HEADER },
    });
  }
}

export class HttpUnauthorizedResponse extends Response {
  constructor(
    body: object | string | undefined = "Unauthorized",
    init: ResponseInit = {},
  ) {
    super(body && JSON.stringify(body), {
      ...init,
      status: 401,
      headers: { ...init.headers, ...JSON_CONTENT_HEADER },
    });
  }
}

export class HttpNotFoundResponse extends Response {
  constructor(
    body: object | string | undefined = "Not Found",
    init: ResponseInit = {},
  ) {
    super(body && JSON.stringify(body), {
      ...init,
      status: 404,
      headers: { ...init.headers, ...JSON_CONTENT_HEADER },
    });
  }
}

export class HttpMethodNotAllowedResponse extends Response {
  constructor(
    body: object | string | undefined = "Method Not Allowed",
    init: ResponseInit = {},
  ) {
    super(body && JSON.stringify(body), {
      ...init,
      status: 405,
      headers: { ...init.headers, ...JSON_CONTENT_HEADER },
    });
  }
}

export class HttpConflictResponse extends Response {
  constructor(body: object | string | undefined = "Conflict", init: ResponseInit = {}) {
    super(body && JSON.stringify(body), {
      ...init,
      status: 409,
      headers: { ...init.headers, ...JSON_CONTENT_HEADER },
    });
  }
}

export class HttpInternalServerErrorResponse extends Response {
  constructor(
    body: object | string | undefined = "Internal Server Error",
    init: ResponseInit = {},
  ) {
    super(body && JSON.stringify(body), {
      ...init,
      status: 500,
      headers: { ...init.headers, ...JSON_CONTENT_HEADER },
    });
  }
}
