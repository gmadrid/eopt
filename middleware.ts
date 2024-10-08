import {NextRequest, NextResponse} from "next/server";
import {getLoginSession, isLoggedIn} from "@/lib/sessions";
import {RequestCookiesAdapter} from "next/dist/server/web/spec-extension/adapters/request-cookies";
import EoptConfig from "@/lib/eopt_config";

export async function middleware(request: NextRequest) {
    let sesh = await getLoginSession(RequestCookiesAdapter.seal(request.cookies));

    // If the session is not logged in, redirect to the login page.
    if (!isLoggedIn(sesh)) {
        return new Response(null, {
            status: 302,
            headers: {
                "Location": `${EoptConfig.server_self_url}nologin/login`
            }
        });
    }

    // If we are here, then we're logged in. We add a header to let the client code know.
    const newHeaders = new Headers(request.headers);
    newHeaders.set("X-LoggedIn", "true");
    return NextResponse.next({
        headers: newHeaders
    });
}


export const config = {
    // make this exclude static paths and api paths and anything under '/nologin'.
    matcher: ['/((?!api|nologin|ping|_next/static|_next/image|favicon.ico).*)']
}
