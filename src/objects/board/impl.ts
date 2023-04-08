import {
  DurableDataOperationObject,
  Operation,
} from "../../common/durable-operation-object";
import {
  RequireParams,
  ValidateParams,
} from "../../common/durable-operation-object/decorators";
import {
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOKResponse,
} from "../../common/responses";

import { createIndexedId } from "../indexer/helpers";
import {
  CreateAccountParams,
  CreateTransactionParams,
  DeleteAccountParams,
  DeleteTransactionParams,
  UpdateAccountParams,
  UpdateTransactionParams,
} from "./params";
import {
  CreateAccountResult,
  CreateTransactionResult,
  GetAccountsResult,
  GetTransactionsResult,
  UpdateAccountResult,
  UpdateTransactionResult,
} from "./results";
import { Account, BoardData, DEFAULT_BOARD_DATA, Transaction } from "./types";
import {
  createAccountValidator,
  createTransactionValidator,
  deleteAccountValidator,
  deleteTransactionValidator,
  updateAccountValidator,
  updateTransactionValidator,
} from "./validators";

// objName: <boardId> (from boardset-boards)
export class Board extends DurableDataOperationObject<BoardData>(DEFAULT_BOARD_DATA) {
  protected get binding(): DurableObjectNamespace {
    return this.env.BOARD;
  }

  async createIndexedId(name: string): Promise<string> {
    return await createIndexedId(this.env, this.state.id.toString(), name);
  }

  async createNewAccountId(): Promise<string> {
    return await this.createIndexedId("account");
  }

  async createNewTransactionId(): Promise<string> {
    return await this.createIndexedId("transaction");
  }

  @Operation
  async getAccounts(): Promise<Response> {
    const accounts = (await this.getData("accounts")) ?? {};

    return new HttpOKResponse<GetAccountsResult>(accounts);
  }

  @Operation
  @RequireParams<CreateAccountParams>("name")
  @ValidateParams(createAccountValidator)
  async createAccount(params: CreateAccountParams): Promise<Response> {
    const newAccountId = await this.createNewAccountId();

    const newAccount: Account = {
      name: params.name,
      type: params.type,
      opening: params.opening ?? 0,
      closing: params.closing ?? 0,
    };

    const accounts = await this.getData("accounts");

    await this.setData({
      accounts: {
        ...accounts,
        [newAccountId]: newAccount,
      },
    });

    return new HttpOKResponse<CreateAccountResult>({ [newAccountId]: newAccount });
  }

  @Operation
  @RequireParams<UpdateAccountParams>("accountId", "account")
  @ValidateParams(updateAccountValidator)
  async updateAccount(params: UpdateAccountParams): Promise<Response> {
    const accounts = await this.getData("accounts");

    if (!accounts) {
      return new HttpNotFoundResponse();
    }

    const account = accounts[params.accountId];

    if (!account) {
      return new HttpNotFoundResponse();
    }

    if (params.account.name !== undefined) {
      account.name = params.account.name;
    }

    if (params.account.type !== undefined && params.account.type !== null) {
      account.type = params.account.type;
    }

    if (params.account.type === null) {
      account.type = undefined;
    }

    if (params.account.opening !== undefined) {
      account.opening = params.account.opening;
    }

    if (params.account.closing !== undefined) {
      account.closing = params.account.closing;
    }

    await this.setData({
      accounts: {
        ...accounts,
        [params.accountId]: account,
      },
    });

    return new HttpOKResponse<UpdateAccountResult>(account);
  }

  @Operation
  @RequireParams<DeleteAccountParams>("accountId")
  @ValidateParams(deleteAccountValidator)
  async deleteAccount(params: DeleteAccountParams): Promise<Response> {
    const accounts = await this.getData("accounts");

    if (!accounts) {
      return new HttpNotFoundResponse();
    }

    const account = accounts[params.accountId];

    if (!account) {
      return new HttpNotFoundResponse();
    }

    delete accounts[params.accountId];

    await this.setData({ accounts: accounts });

    return new HttpNoContentResponse();
  }

  @Operation
  async getTransactions(): Promise<Response> {
    const transactions = (await this.getData("transactions")) ?? {};

    return new HttpOKResponse<GetTransactionsResult>(transactions);
  }

  @Operation
  @RequireParams<CreateTransactionParams>("type", "description")
  @ValidateParams(createTransactionValidator)
  async createTransaction(params: CreateTransactionParams): Promise<Response> {
    const newTransactionId = await this.createIndexedId("transaction");

    const newTransaction: Transaction = {
      amount: params.amount ?? 0,
      cadence: params.cadence ?? "occasional",
      description: params.description,
      type: params.type,
    };

    const transactions = await this.getData("transactions");

    await this.setData({
      transactions: {
        ...transactions,
        [newTransactionId]: newTransaction,
      },
    });

    return new HttpOKResponse<CreateTransactionResult>({
      [newTransactionId]: newTransaction,
    });
  }

  @Operation
  @RequireParams<UpdateTransactionParams>("transactionId", "transaction")
  @ValidateParams(updateTransactionValidator)
  async updateTransaction(params: UpdateTransactionParams): Promise<Response> {
    const transactions = await this.getData("transactions");

    if (!transactions) {
      return new HttpNotFoundResponse();
    }

    const transaction = transactions[params.transactionId];

    if (!transaction) {
      return new HttpNotFoundResponse();
    }

    if (params.transaction.description !== undefined) {
      transaction.description = params.transaction.description;
    }

    if (params.transaction.type !== undefined) {
      transaction.type = params.transaction.type;
    }

    if (params.transaction.cadence !== undefined) {
      transaction.cadence = params.transaction.cadence;
    }

    if (params.transaction.amount !== undefined) {
      transaction.amount = params.transaction.amount;
    }

    await this.setData({
      transactions: {
        ...transactions,
        [params.transactionId]: transaction,
      },
    });

    return new HttpOKResponse<UpdateTransactionResult>(transaction);
  }

  @Operation
  @RequireParams<DeleteTransactionParams>("transactionId")
  @ValidateParams(deleteTransactionValidator)
  async deleteTransaction(params: DeleteTransactionParams): Promise<Response> {
    const transactions = await this.getData("transactions");

    if (!transactions) {
      return new HttpNotFoundResponse();
    }

    const transaction = transactions[params.transactionId];

    if (!transaction) {
      return new HttpNotFoundResponse();
    }

    delete transactions[params.transactionId];

    await this.setData({ transactions: transactions });

    return new HttpNoContentResponse();
  }

  @Operation
  async _purgeData(): Promise<Response> {
    await this.purgeData();

    return new HttpNoContentResponse();
  }
}
