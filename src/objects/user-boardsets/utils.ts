import { OperationParameterInvalidError } from "../../common/durable-operation-object/errors";

export function validateCurrency(maybeCurrency?: string | null): void {
  if (maybeCurrency && maybeCurrency.length !== 0) {
    try {
      Intl.NumberFormat("en", {
        style: "currency",
        currency: maybeCurrency.toUpperCase(),
      });
    } catch (error) {
      throw new OperationParameterInvalidError("currency");
    }
  }
}
