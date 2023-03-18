export class OperationParameterRequiredError extends Error {
  name = "OperationParameterRequiredError";

  constructor(message = "Operation Parameter Required") {
    super(message);
  }
}
