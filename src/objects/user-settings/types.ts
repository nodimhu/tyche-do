export type UserSettingsData = {
  locale: string;
  defaultCurrency: string;
};

export const DEFAULT_USER_SETTINGS_DATA: UserSettingsData = {
  locale: "en-US",
  defaultCurrency: "USD",
};
