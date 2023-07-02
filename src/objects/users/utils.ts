import sha256 from "crypto-js/sha256";

export function createPasswordHashData(password: string): HashData {
  const randomValues = crypto.getRandomValues(new Uint8Array(16));

  const passwordSalt = Array.from(randomValues)
    .map((byteValue) => ("0" + byteValue.toString(16)).slice(-2))
    .join("");

  const passwordHash = sha256(password + passwordSalt).toString();

  return {
    hash: passwordHash,
    salt: passwordSalt,
  };
}

export function verifyPassword(password: string, passwordHashData: HashData): boolean {
  const passwordHash = sha256(password + passwordHashData.salt).toString();

  return passwordHash === passwordHashData.hash;
}

export function withoutPasswordHashData(
  user: TycheDO.Users.User,
): Omit<TycheDO.Users.User, "passwordHashData"> {
  const returnUser: Partial<TycheDO.Users.User> = { ...user };
  delete returnUser.passwordHashData;
  return returnUser as Omit<TycheDO.Users.User, "passwordHashData">;
}
