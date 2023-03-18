export function isFunction(
  maybeFunction: unknown,
): maybeFunction is (...args: unknown[]) => unknown {
  if (!maybeFunction) {
    return false;
  }
  return typeof maybeFunction === "function";
}

export function hasOwnProperty<P extends string>(
  maybeObject: unknown,
  propertyName: P,
): maybeObject is Record<P, unknown> {
  if (!maybeObject) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(maybeObject, propertyName);
}
