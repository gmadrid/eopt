import {getIronSession, IronSession} from "iron-session";
import {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";
import OAuth from "oauth-1.0a";
import EoptConfig from "@/lib/eopt_config";

const OAUTH_LOGGED_IN_COOKIE_NAME = "EOPT_SESH";

export interface LoginSession {
    token: OAuth.Token;
    // true if this is a half-session (we have a request token, but not an access token yet)
    half_session: boolean;
}

export async function getLoginSession(cookies: ReadonlyRequestCookies): Promise<IronSession<LoginSession>> {
    return await getSesh(cookies);
}

export async function killLoginSession(cookies: ReadonlyRequestCookies) {
    let sesh = await getSesh(cookies);
    sesh.destroy();
}

async function getSesh(cookies: ReadonlyRequestCookies): Promise<IronSession<LoginSession>> {
    return await getIronSession(cookies, {
        password: EoptConfig.session_cookie_password,
        cookieName: OAUTH_LOGGED_IN_COOKIE_NAME
    });
}


export function isLoggedIn(sesh: LoginSession) {
    return sesh.token && !sesh.half_session;
}
