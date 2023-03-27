import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import { OperationParameterInvalidError } from "../../common/durable-operation-object/errors";
import { HttpNoContentResponse, HttpOKResponse } from "../../common/responses";

import { UpdateUserSettingsParams } from "./params";
import { GetUserSettingsResult, UpdateUserSettingsResult } from "./results";
import { DEFAULT_USER_SETTINGS_DATA, UserSettingsData } from "./types";

// objName: <username>
export class UserSettings extends DurableDataOperationObject<UserSettingsData>(
  DEFAULT_USER_SETTINGS_DATA,
) {
  protected get binding(): DurableObjectNamespace {
    return this.env.USER_SETTINGS;
  }

  @Operation
  async getSettings(): Promise<Response> {
    const userSettingsData = await this.getData();

    return new HttpOKResponse<GetUserSettingsResult>(userSettingsData);
  }

  @Operation
  async updateSettings(params: UpdateUserSettingsParams): Promise<Response> {
    const userSettingsData = await this.getData();

    if (params.defaultCurrency) {
      // TODO: Do this in validator instead...
      try {
        new Intl.NumberFormat("en", {
          style: "currency",
          currency: params.defaultCurrency.toUpperCase(),
        });
      } catch (error) {
        throw new OperationParameterInvalidError("defaultCurrency");
      }
      // ...up to this point.

      userSettingsData.defaultCurrency = params.defaultCurrency.toUpperCase();
    }

    if (params.locale) {
      // TODO: Do this in validator instead...
      try {
        new Intl.Locale(params.locale);
      } catch (error) {
        throw new OperationParameterInvalidError("locale");
      }
      // ...up to this point.

      userSettingsData.locale = params.locale;
    }

    await this.setData(userSettingsData);

    return new HttpOKResponse<UpdateUserSettingsResult>(userSettingsData);
  }

  @Operation
  async _purgeData(): Promise<Response> {
    await this.purgeData();

    return new HttpNoContentResponse();
  }
}
