import { validateParams } from "../../common/durable-operation-object/helpers";

export function createAccountValidator(params: TycheDO.Board.CreateAccountParams) {
  validateParams({
    name: !!params.name && typeof params.name === "string",
    type:
      params.type === undefined ||
      params.type === "cash" ||
      params.type === "checking" ||
      params.type === "investment" ||
      params.type === "savings",
    opening: params.opening === undefined || typeof params.opening === "number",
    closing: params.closing === undefined || typeof params.closing === "number",
  });
}

export function updateAccountValidator(params: TycheDO.Board.UpdateAccountParams) {
  validateParams({
    accountId: !!params.accountId && typeof params.accountId === "string",
    account: !!params.account && typeof params.account === "object",
    "account.name":
      params.account.name === undefined ||
      (!!params.account.name && typeof params.account.name === "string"),
    "account.type":
      params.account.type === null ||
      params.account.type === undefined ||
      params.account.type === "cash" ||
      params.account.type === "checking" ||
      params.account.type === "investment" ||
      params.account.type === "savings",
    "account.opening":
      params.account.opening === undefined ||
      typeof params.account.opening === "number",
    "account.closing":
      params.account.closing === undefined ||
      typeof params.account.closing === "number",
  });
}

export function deleteAccountValidator(params: TycheDO.Board.DeleteAccountParams) {
  validateParams({
    accountId: !!params.accountId && typeof params.accountId === "string",
  });
}

export function createTransactionValidator(
  params: TycheDO.Board.CreateTransactionParams,
) {
  validateParams({
    description: !!params.description && typeof params.description === "string",
    type: params.type === "expense" || params.type === "income",
    cadence:
      params.cadence === undefined ||
      params.cadence === "recurring" ||
      params.cadence === "occasional",
    amount: params.amount === undefined || typeof params.amount === "number",
  });
}

export function updateTransactionValidator(
  params: TycheDO.Board.UpdateTransactionParams,
) {
  validateParams({
    transactionId: !!params.transactionId && typeof params.transactionId === "string",
    transaction: !!params.transaction && typeof params.transaction === "object",
    "transaction.description":
      params.transaction.description === undefined ||
      (!!params.transaction.description &&
        typeof params.transaction.description === "string"),
    "transaction.type":
      params.transaction.type === undefined ||
      params.transaction.type === "expense" ||
      params.transaction.type === "income",
    "transaction.cadence":
      params.transaction.cadence === undefined ||
      params.transaction.cadence === "recurring" ||
      params.transaction.cadence === "occasional",
    "transaction.amount":
      params.transaction.amount === undefined ||
      typeof params.transaction.amount === "number",
  });
}

export function deleteTransactionValidator(
  params: TycheDO.Board.DeleteTransactionParams,
) {
  validateParams({
    transactionId: !!params.transactionId && typeof params.transactionId === "string",
  });
}

export function updateParametersValidator(
  params: TycheDO.Board.UpdateParametersParams,
) {
  validateParams({
    savingsGoalPercentage:
      params.savingsGoalPercentage === undefined ||
      typeof params.savingsGoalPercentage === "number",
  });
}
