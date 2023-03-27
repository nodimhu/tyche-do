import { Account, Transaction } from "./types";

export type CreateAccountParams = Partial<Account>;

export type CreateTransactionParams = {
  type: Transaction["type"];
} & Partial<Transaction>;

export type UpdateAccountParams = {
  accountId: string;
  account: {
    type?: Account["type"] | null;
  } & Partial<Omit<Account, "type">>;
};

export type UpdateTransactionParams = {
  transactionId: string;
  transaction: Partial<Transaction>;
};

export type DeleteAccountParams = {
  accountId: string;
};

export type DeleteTransactionParams = {
  transactionId: string;
};
