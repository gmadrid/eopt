import {getIronSession, IronSession} from "iron-session";
import {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";
import OAuth from "oauth-1.0a";

// TODO: gotta read this from somewhere.
const FAKE_SESH_PASSWORD = "SESH_PASS_THIS_IS_A_BAD_PASSWORD";
const OAUTH_HALF_COOKIE_NAME = "EOPT_HALF";
const OAUTH_LOGGED_IN_COOKIE_NAME = "EOPT_SESH";

export interface LoginSession {
    token: OAuth.Token;
    // true if this is a half-session (we have a request token, but not an access token yet)
    half_session: boolean;
}

export async function getLoginSession(cookies: ReadonlyRequestCookies): Promise<IronSession<LoginSession>> {
    return await getIronSession(cookies, { password: FAKE_SESH_PASSWORD, cookieName: OAUTH_LOGGED_IN_COOKIE_NAME });
}
