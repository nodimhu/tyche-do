import { validateParams } from "../../common/durable-operation-object/helpers";
import { isCurrency, isLocale } from "../../common/utils";

export function updateSettingsValidator(
  params: TycheDO.UserSettings.UpdateUserSettingsParams,
) {
  validateParams({
    locale:
      params.locale === undefined ||
      (!!params.locale && typeof params.locale === "string" && isLocale(params.locale)),
    defaultCurrency:
      params.defaultCurrency === undefined ||
      (!!params.defaultCurrency &&
        typeof params.defaultCurrency === "string" &&
        isCurrency(params.defaultCurrency)),
  });
}
