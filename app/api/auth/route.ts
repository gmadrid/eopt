import {NextResponse} from "next/server";
import {ETradeClient} from "@/lib/etradeclient";
import {cookies} from "next/headers";
import {getLoginSession} from "@/lib/sessions";

export async function GET() {
    const sesh = await getLoginSession(cookies());

    // No auth token since we're bootstrapping the login.
    const client = new ETradeClient();

    var auth_data = await client.getAuthorizationUrl();
    sesh.token = auth_data.request_token;
    sesh.half_session = true;
    await sesh.save();

    return NextResponse.json({auth_url: auth_data.authorize_url});
}


