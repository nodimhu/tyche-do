export function isLocale(maybeLocale: string) {
  try {
    new Intl.Locale(maybeLocale);
    return true;
  } catch {
    return false;
  }
}

export function isCurrency(maybeCurrency: string) {
  try {
    Intl.NumberFormat("en", {
      style: "currency",
      currency: maybeCurrency.toUpperCase(),
    });
    return true;
  } catch {
    return false;
  }
}
