import {NextRequest, NextResponse} from "next/server";
import {getLoginSession, isLoggedIn} from "@/lib/sessions";
import {RequestCookiesAdapter} from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function middleware(request: NextRequest) {
    let sesh = await getLoginSession(RequestCookiesAdapter.seal(request.cookies));

    // If the session is not logged in, redirect to the login page.
    if (!isLoggedIn(sesh)) {
        return new Response(null, {
            status: 302,
            headers: {
                // TODO: remove (or parameterize) hostname
                "Location": "http://localhost:3333/nologin/login"
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
    // TODO: make this exclude static paths and api paths and anything under '/nologin'.
    matcher: ['/((?!api|nologin|ping|_next/static|_next/image|favicon.ico).*)']
}
