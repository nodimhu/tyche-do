import { OperationParameterInvalidError } from "../../common/durable-operation-object/errors";

export function validateDefaultCurrency(maybeCurrency?: string | null): void {
  if (maybeCurrency && maybeCurrency.length !== 0) {
    try {
      Intl.NumberFormat("en", { style: "currency", currency: maybeCurrency });
    } catch (error) {
      throw new OperationParameterInvalidError("defaultCurrency");
    }
  }
}
