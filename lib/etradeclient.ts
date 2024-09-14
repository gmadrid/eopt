import OAuth from "oauth-1.0a";
import crypto from "crypto";

const consumer_key = process.env.ETRADE_CONSUMER_KEY!;
const consumer_secret = process.env.ETRADE_CONSUMER_SECRET!;

function hash_function_sha1(base_string: string, key: string) {
    return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64')
}

interface AuthorizationResponse {
    request_token: OAuth.Token,
    authorize_url: string
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

        let response = await fetch(makeRequest(request_data.url, authString));
        if (response.status !== 200) {
            throw new Error(`Failed to get authorization URL: {response.status}: {response.statusText}`);
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
        const response = await fetch(request);
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

    // TODO: declare the Accounts type.
    async getAccounts() {
        if (!this.token) {
            throw new Error("getAccounts requires access token.");
        }

        const request_data = {
            url: "https://api.etrade.com/v1/accounts/list",
            method: 'GET',
            data: {}
        };

        let authorization = this.oauth.authorize(request_data, this.token);
        let authHeader = this.oauth.toHeader(authorization).Authorization;

        let request = makeRequest(request_data.url, authHeader);
        const response = await fetch(request);
        if (response.status !== 200) {
            throw new Error(`getAccounts failed: {response.status}: {response.statusText}`);
        }

        return await response.json();
    }

    async getAccountBalances(accountIdKey: string): Promise<AccountBalances> {
        if (!this.token) {
            throw new Error("getAccountBalances requires access token.");
        }
        const request_data = {
            url: `https://api.etrade.com/v1/accounts/${accountIdKey}/balance?instType=BROKERAGE&realTimeNAV=true`,
            method: 'GET',
            data: {}
        };

        let authorization = this.oauth.authorize(request_data, this.token);
        let authHeader = this.oauth.toHeader(authorization).Authorization;

        // TODO: Some DRY here
        let request = makeRequest(request_data.url, authHeader);
        const response = await fetch(request);
        if (response.status !== 200) {
            throw new Error(`getAccountBalances failed: {response.status}: {response.statusText}`);
        }

        let wrapper = await response.json();
        return wrapper.BalanceResponse;
    }

    async getTransactions(accountIdKey: string, startDate: string, endDate: string): Promise<TransactionListResponse> {
        if (!this.token) {
            throw new Error("getTransactions requires access token.");
        }

        const request_data = {
            url: `https://api.etrade.com/v1/accounts/${accountIdKey}/transactions?startDate=${startDate}&endDate=${endDate}`,
            method: 'GET',
            data: {}
        };

        let authorization = this.oauth.authorize(request_data, this.token);
        let authHeader = this.oauth.toHeader(authorization).Authorization;

        let request = makeRequest(request_data.url, authHeader);
        const response = await fetch(request);
        if (response.status !== 200) {
            throw new Error(`getTransactions failed: ${response.status}: ${response.statusText}`);
        }

        let wrapper = await response.json();
        return wrapper.TransactionListResponse as TransactionListResponse;
    }
}

function makeRequest(url: string, authString: string) {
    return new Request(url, {
        headers: new Headers([
            ["Authorization", authString],
            ["Accept", "application/json"]
        ]),
    });
}

