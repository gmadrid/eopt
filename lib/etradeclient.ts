import OAuth from "oauth-1.0a";
import crypto from "crypto";

const consumer_key = process.env.ETRADE_CONSUMER_KEY!;
const consumer_secret = process.env.ETRADE_CONSUMER_SECRET!;

function hash_function_sha1(base_string: string, key: string): string {
    return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64')
}

export interface AuthorizationResponse {
    request_token: OAuth.Token,
    authorize_url: string
}

export interface AccountListResponseWrapper {
    AccountListResponse: AccountListResponse;
}

export interface AccountListResponse {
    Accounts: AccountInner;
}

interface AccountInner {
    Account: Account[];
}

export interface Account {
    accountId: string;
    accountIdKey: string;
    accountDesc: string;
}

export interface AccountBalanceResponse {
    BalanceResponse: AccountBalances,
}

export interface AccountBalances {
    accountId: string,
    accountType: string,
    optionLevel: string,
    accountDescription: string,
    accountMode: string,
    Computed: ComputedBalance,
}

interface ComputedBalance {
    RealTimeValues: RealTimeValues,
}

interface RealTimeValues {
    totalAccountValue: number,
    netMv: number,
    netMvLong: number,
    netMvShort: number,
}

export interface TransactionListResponseWrapper {
    TransactionListResponse: TransactionListResponse
}

export interface TransactionListResponse {
    Transaction: Transaction[],
}

export interface Transaction {
    transactionId: string,
    amount: number,
    description: string,
    transactionType: string,
    brokerage: Brokerage,
    transactionDate: number,
}

export interface Brokerage {
    product: Product,
    quantity: number,
    price: number,
    fee: number,
    displaySymbol: string,
    settlementDate: number,
}

export interface Product {
    symbol: string,
    securityType: string,
    callPut: string,
    // This appears to be just the last two digits. The 20xx year is implied.
    expiryYear: number,
    // 1-indexed
    expiryMonth: number,
    // 1-indexed
    expiryDay: number,
    strikePrice: number,
}

export const expirationDate = (product: Product): Date => {
    return new Date(product.expiryYear, product.expiryMonth - 1, product.expiryDay);
}

interface PortfolioResponseWrapper {
    PortfolioResponse: PortfolioResponse,
}

interface PortfolioResponse {
    AccountPortfolio: AccountPortfolio[],
}

interface AccountPortfolio {
    Position: Position[],
}

export interface Portfolio {
    positions: Position[],
}

export interface Position {
    positionId: number,
    Product: Product,
    Complete: Complete,
}

export interface Complete {
    baseSymbolAndPrice: string,
}

/// Wrapper around the ETrade API.
/// No requests are cached.
export class ETradeClient {
    oauth: OAuth;
    token?: OAuth.Token;

    // Add an optional argument, `token`, that will avoid having to pass the auth values to every API method.
    constructor(token?: OAuth.Token) {
        this.oauth = new OAuth({
            consumer: {key: consumer_key, secret: consumer_secret},
            signature_method: "HMAC-SHA1",
            hash_function: hash_function_sha1
        });
        if (token) {
            this.token = token;
        }
    }

    async getAuthorizationUrl(): Promise<AuthorizationResponse> {
        const request_data = {
            url: "https://api.etrade.com/oauth/request_token",
            method: 'GET',
            data: {oauth_callback: "oob"}
        };

        let authorization = this.oauth.authorize(request_data);
        let authString = this.oauth.toHeader(authorization).Authorization;
        let response = await fetch(makeRequest(request_data.url, authString), {cache: 'no-store'});
        if (response.status !== 200) {
            throw new Error(`Failed to get authorization URL: ${response.status}: ${response.statusText}`);
        }

        const body = await response.text();
        const urlParams = new URLSearchParams(body);

        const token = {
            key: urlParams.get("oauth_token")!,
            secret: urlParams.get("oauth_token_secret")!
        };

        const authorizeUrl = "https://us.etrade.com/e/t/etws/authorize";
        const authorizeParams = new URLSearchParams({key: this.oauth.consumer.key, token: token.key});
        const authorizeUrlWithParams = `${authorizeUrl}?${authorizeParams.toString()}`;

        return {
            request_token: token,
            authorize_url: authorizeUrlWithParams
        };
    }

    async getAccessToken(verifier: string): Promise<OAuth.Token> {
        if (!this.token) {
            throw new Error("Request token is required to get access token");
        }

        const request_data = {
            url: "https://api.etrade.com/oauth/access_token",
            method: 'GET',
            data: {oauth_verifier: verifier}
        };

        let authorization = this.oauth.authorize(request_data, this.token);
        let authHeader = this.oauth.toHeader(authorization).Authorization;

        let request = makeRequest(request_data.url, authHeader);
        const response = await fetch(request, {cache: 'no-store'});
        if (response.status !== 200) {
            throw new Error(`Failed to get access token: {response.status}: {response.statusText}`);
        }

        const body = await response.text();
        const urlParams = new URLSearchParams(body);

        return {
            key: urlParams.get("oauth_token")!,
            secret: urlParams.get("oauth_token_secret")!
        };
    }

    async getJsonResponse<T>(name: string, url: string, handle204?: () => T): Promise<T> {
        if (!this.token) {
            throw new Error(`${name} requires access token.`);
        }

        const request_data = {
            url: url,
            method: 'GET',
            data: {}
        };

        let authorization = this.oauth.authorize(request_data, this.token);
        let authHeader = this.oauth.toHeader(authorization).Authorization;

        let request = makeRequest(request_data.url, authHeader);
        const response = await fetch(request, {cache: 'no-store'});
        if (response.status === 204 && handle204) {
            return handle204();
        }
        if (response.status !== 200) {
            throw new Error(`${name} failed: ${response.status}: ${response.statusText}`);
        }

        return await response.json() as T;
    }

    async getAccounts(): Promise<AccountListResponseWrapper> {
        return await this.getJsonResponse(
            "getAccounts",
            "https://api.etrade.com/v1/accounts/list"
        );
    }

    async getAccountBalances(accountIdKey: string): Promise<AccountBalances> {
        const wrapper = await this.getJsonResponse<AccountBalanceResponse>(
            "getAccountBalances",
            `https://api.etrade.com/v1/accounts/${accountIdKey}/balance?instType=BROKERAGE&realTimeNAV=true`);
        return wrapper.BalanceResponse;
    }

    async getPortfolio(accountIdKey: string): Promise<Portfolio> {
        const wrapper = await this.getJsonResponse<PortfolioResponseWrapper>(
            "getPortfolio",
            `https://api.etrade.com/v1/accounts/${accountIdKey}/portfolio?count=200&view=COMPLETE`);
        return {positions: wrapper.PortfolioResponse.AccountPortfolio[0].Position};
    }

    async getTransactions(accountIdKey: string, startDate: string, endDate: string): Promise<TransactionListResponse> {
        const wrapper = await this.getJsonResponse<TransactionListResponseWrapper>(
            "getTransactions",
            `https://api.etrade.com/v1/accounts/${accountIdKey}/transactions?startDate=${startDate}&endDate=${endDate}`,
            () => ({TransactionListResponse: {Transaction: []}})
        );
        return wrapper.TransactionListResponse;
    }
}

function makeRequest(url: string, authString: string): Request {
    return new Request(url, {
        headers: new Headers([
            ["Authorization", authString],
            ["Accept", "application/json"]
        ]),
    });
}

