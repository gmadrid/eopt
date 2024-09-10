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

function makeRequest(url: string, authString: string) {
    return new Request(url, {
        headers: new Headers([
            ["Authorization", authString],
            ["Accept", "application/json"]
        ]),
    });
}

export class ETradeClient {
    oauth: OAuth;
    token?: OAuth.Token;

    // Add an optional argument, `token`, that will avoid having to pass the auth values to every API method.
    constructor(token?: OAuth.Token) {
        this.oauth = new OAuth({
            consumer: { key: consumer_key, secret: consumer_secret },
            signature_method: "HMAC-SHA1",
            hash_function: hash_function_sha1
        });
        if (token) {
            this.token = token;
        }
    }

    async getAuthorizationUrl() : Promise<AuthorizationResponse> {
        const request_data = {
            url: "https://api.etrade.com/oauth/request_token",
            method: 'GET',
            data: { oauth_callback: "oob" }
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

        const authorizeUrl =  "https://us.etrade.com/e/t/etws/authorize";
        const authorizeParams = new URLSearchParams({key: this.oauth.consumer.key, token: token.key });
        const authorizeUrlWithParams = `${authorizeUrl}?${authorizeParams.toString()}`;

        return {
            request_token: token,
            authorize_url: authorizeUrlWithParams
        };
    }

    async getAccessToken(verifier: string) : Promise<OAuth.Token> {
        if (!this.token) {
            throw new Error("Request token is required to get access token");
        }

        const request_data = {
            url: "https://api.etrade.com/oauth/access_token",
            method: 'GET',
            data: {oauth_verifier: verifier}
        };

        console.log("REQUEST TOKEN: ", this.token);
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
        let authString = this.oauth.toHeader(authorization).Authorization;

        let request = makeRequest(request_data.url, authString);
        const response = await fetch(request);
        if (response.status !== 200) {
            throw new Error(`getAccounts failed: {response.status}: {response.statusText}`);
        }

        return await response.json();
    }
}
