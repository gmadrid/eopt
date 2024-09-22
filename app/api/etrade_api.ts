'use client';

/// Client-side code to call the eTrade API.

import {formatDateEtrade} from "@/lib/format";
import {
    Account,
    AccountBalances,
    AccountListResponse,
    PortfolioResponse,
    TransactionListResponse
} from "@/lib/etradeclient";
import combineTransactions from "@/lib/combine";

export class ETradeClientAPI {
    readonly api_url_prefix: string;

    constructor(api_url_prefix: string) {
        this.api_url_prefix = api_url_prefix;
    }

    async ping(msg: string) {
        await fetch(`${this.api_url_prefix}api/ping?m=` + msg);
    }

    async getAccounts(): Promise<Account[]> {
        return fetch(`${this.api_url_prefix}api/accounts`)
            .then(r => r.json())
            .then(j => (j.AccountListResponse as AccountListResponse).Accounts.Account);
    }

    async getAuthUrl(): Promise<string> {
        return fetch(`${this.api_url_prefix}api/auth`)
            .then(r => r.json())
            .then(j => j.url as string);
    }

    async getBalances(accountIdKey: string): Promise<AccountBalances> {
        return fetch(`${this.api_url_prefix}api/balances/${accountIdKey}`)
            .then(r => r.json())
            .then(j => j as AccountBalances);
    }

    async getPortfolio(accountIdKey: string): Promise<PortfolioResponse> {
        return fetch(`${this.api_url_prefix}api/portfolio/${accountIdKey}`)
            .then(r => r.json())
            .then(j => j as PortfolioResponse);
    }

    async getAccessToken(verifier: string): Promise<void> {
        return fetch(`${this.api_url_prefix}api/auth_callback?verifier=${verifier}`)
            .then(r => r.json())
            .then(_j => {
                return;
            });
    }

    async getTransactions(
        accountIdKey: string,
        startDate: Date,
        endDate: Date,
        combine: boolean): Promise<TransactionListResponse> {

        if (startDate >= endDate) {
            throw (new Error(`Start date, ${startDate} must be before end date, ${endDate}`));
        }

        const url = `${this.api_url_prefix}api/transactions/${accountIdKey}?startDate=${formatDateEtrade(startDate)}&endDate=${formatDateEtrade(endDate)}`;
        return fetch(url)
            .then(r => r.json())
            .then(j => {
                let transaction_list_response = j as TransactionListResponse;
                if (combine) {
                    transaction_list_response.Transaction = combineTransactions(transaction_list_response.Transaction);
                }
                return transaction_list_response;
            });
    }

    async logout(): Promise<void> {
        return fetch(`${this.api_url_prefix}api/unauth`)
            .then(_r => {
            })
    }
}

