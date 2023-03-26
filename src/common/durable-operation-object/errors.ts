export class OperationError extends Error {
  name = "OperationError";

  constructor(message: string) {
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

// TODO: See decorators.

// export class OperationSearchParameterRequiredError extends OperationError {
//   name = "OperationSearchParameterRequiredError";

//   constructor(message: string) {
//     const constructedMessage =
//       "Operation Search Parameter Required" + (message ? ": " + message : "");
//     super(constructedMessage);
//   }
// }

// export class OperationSearchParameterInvalidError extends OperationError {
//   name = "OperationSearchParameterInvalidError";

//   constructor(message: string) {
//     const constructedMessage =
//       "Operation Search Parameter Invalid" + (message ? ": " + message : "");
//     super(constructedMessage);
//   }
// }
