import {NextRequest, NextResponse} from "next/server";
import {ETradeClient} from "@/lib/etradeclient";
import {cookies} from "next/headers";
import {getLoginSession} from "@/lib/sessions";

export async function GET(request: NextRequest) {
    const sesh = await getLoginSession(cookies());
    if (sesh.token && !sesh.half_session) {
        return NextResponse.json({ok: "already logged in"})
    }

    const verifier = request.nextUrl.searchParams.get("verifier");
    if (!verifier) {
        return new Response("No verifier found", {status: 400});
    }

    const client = new ETradeClient(sesh.token);

    const access_token = await client.getAccessToken(verifier);
    sesh.token = access_token;
    sesh.half_session = false;
    await sesh.save();

    return NextResponse.json({ok: "ok"});
}
