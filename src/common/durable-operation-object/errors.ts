export class OperationError extends Error {
  name = "OperationError";

  constructor(message?: string) {
    const constructedMessage = message || "Operation Error";
    super(constructedMessage);
  }
}

export class OperationParameterRequiredError extends OperationError {
  name = "OperationParameterRequiredError";

  constructor(message: string) {
    const constructedMessage =
      "Operation Parameter Required" + (message ? ": " + message : "");
    super(constructedMessage);
  }
}

export class OperationParameterInvalidError extends OperationError {
  name = "OperationParameterInvalidError";

  constructor(message: string) {
    const constructedMessage =
      "Operation Parameter Invalid" + (message ? ": " + message : "");
    super(constructedMessage);
  }
}
