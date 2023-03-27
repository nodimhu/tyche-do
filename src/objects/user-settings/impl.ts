import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import { ValidateParams } from "../../common/durable-operation-object/decorators";
import { HttpNoContentResponse, HttpOKResponse } from "../../common/responses";

import { UpdateUserSettingsParams } from "./params";
import { GetUserSettingsResult, UpdateUserSettingsResult } from "./results";
import { DEFAULT_USER_SETTINGS_DATA, UserSettingsData } from "./types";
import { updateSettingsValidator } from "./validators";

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
  @ValidateParams(updateSettingsValidator)
  async updateSettings(params: UpdateUserSettingsParams): Promise<Response> {
    const userSettingsData = await this.getData();

    if (params.defaultCurrency !== undefined) {
      userSettingsData.defaultCurrency = params.defaultCurrency.toUpperCase();
    }

    if (params.locale !== undefined) {
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
