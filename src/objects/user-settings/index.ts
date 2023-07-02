import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import { ValidateParams } from "../../common/durable-operation-object/decorators";
import { HttpNoContentResponse, HttpOKResponse } from "../../common/responses";
import { updateSettingsValidator } from "./validators";

const DEFAULT_USER_SETTINGS_DATA: TycheDO.UserSettings.UserSettingsData = {
  locale: "en-US",
  defaultCurrency: "USD",
};

// objName: <username>
export class UserSettings extends DurableDataOperationObject<TycheDO.UserSettings.UserSettingsData>(
  DEFAULT_USER_SETTINGS_DATA,
) {
  protected get binding(): DurableObjectNamespace {
    return this.env.USER_SETTINGS;
  }

  @Operation
  async getSettings(): Promise<Response> {
    const userSettingsData = await this.getData();

    return new HttpOKResponse<TycheDO.UserSettings.GetUserSettingsResult>(
      userSettingsData,
    );
  }

  @Operation
  @ValidateParams(updateSettingsValidator)
  async updateSettings(
    params: TycheDO.UserSettings.UpdateUserSettingsParams,
  ): Promise<Response> {
    const userSettingsData = await this.getData();

    if (params.defaultCurrency !== undefined) {
      userSettingsData.defaultCurrency = params.defaultCurrency.toUpperCase();
    }

    if (params.locale !== undefined) {
      userSettingsData.locale = params.locale;
    }

    await this.setData(userSettingsData);

    return new HttpOKResponse<TycheDO.UserSettings.UpdateUserSettingsResult>(
      userSettingsData,
    );
  }

  @Operation
  async _purgeData(): Promise<Response> {
    await this.purgeData();

    return new HttpNoContentResponse();
  }
}
