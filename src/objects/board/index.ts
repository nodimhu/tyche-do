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
  createAccountValidator,
  createTransactionValidator,
  deleteAccountValidator,
  deleteTransactionValidator,
  updateAccountValidator,
  updateParametersValidator,
  updateTransactionValidator,
} from "./validators";

const DEFAULT_BOARD_DATA: TycheDO.Board.BoardData = {
  accounts: {},
  transactions: {},
  parameters: {
    savingsGoalPercentage: 0,
  },
};

// objName: <boardId> (from boardset-boards)
export class Board extends DurableDataOperationObject<TycheDO.Board.BoardData>(
  DEFAULT_BOARD_DATA,
) {
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

    return new HttpOKResponse<TycheDO.Board.GetAccountsResult>(accounts);
  }

  @Operation
  @RequireParams<TycheDO.Board.CreateAccountParams>("name")
  @ValidateParams(createAccountValidator)
  async createAccount(params: TycheDO.Board.CreateAccountParams): Promise<Response> {
    const newAccountId = await this.createNewAccountId();

    const newAccount: TycheDO.Board.Account = {
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

    return new HttpOKResponse<TycheDO.Board.CreateAccountResult>({
      [newAccountId]: newAccount,
    });
  }

  @Operation
  @RequireParams<TycheDO.Board.UpdateAccountParams>("accountId", "account")
  @ValidateParams(updateAccountValidator)
  async updateAccount(params: TycheDO.Board.UpdateAccountParams): Promise<Response> {
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

    return new HttpOKResponse<TycheDO.Board.UpdateAccountResult>(account);
  }

  @Operation
  @RequireParams<TycheDO.Board.DeleteAccountParams>("accountId")
  @ValidateParams(deleteAccountValidator)
  async deleteAccount(params: TycheDO.Board.DeleteAccountParams): Promise<Response> {
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

    return new HttpOKResponse<TycheDO.Board.GetTransactionsResult>(transactions);
  }

  @Operation
  @RequireParams<TycheDO.Board.CreateTransactionParams>("type", "description")
  @ValidateParams(createTransactionValidator)
  async createTransaction(
    params: TycheDO.Board.CreateTransactionParams,
  ): Promise<Response> {
    const newTransactionId = await this.createIndexedId("transaction");

    const newTransaction: TycheDO.Board.Transaction = {
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

    return new HttpOKResponse<TycheDO.Board.CreateTransactionResult>({
      [newTransactionId]: newTransaction,
    });
  }

  @Operation
  @RequireParams<TycheDO.Board.UpdateTransactionParams>("transactionId", "transaction")
  @ValidateParams(updateTransactionValidator)
  async updateTransaction(
    params: TycheDO.Board.UpdateTransactionParams,
  ): Promise<Response> {
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

    return new HttpOKResponse<TycheDO.Board.UpdateTransactionResult>(transaction);
  }

  @Operation
  @RequireParams<TycheDO.Board.DeleteTransactionParams>("transactionId")
  @ValidateParams(deleteTransactionValidator)
  async deleteTransaction(
    params: TycheDO.Board.DeleteTransactionParams,
  ): Promise<Response> {
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
  async getParameters(): Promise<Response> {
    return new HttpOKResponse(await this.getData("parameters"));
  }

  @Operation
  @ValidateParams(updateParametersValidator)
  async updateParameters(
    params: TycheDO.Board.UpdateParametersParams,
  ): Promise<Response> {
    const parameters = await this.getData("parameters");

    Object.assign(parameters, params);

    await this.setData({ parameters });

    return new HttpOKResponse(parameters);
  }

  @Operation
  async _purgeData(): Promise<Response> {
    await this.purgeData();

    return new HttpNoContentResponse();
  }
}
