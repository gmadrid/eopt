import {NextRequest, NextResponse} from "next/server";
import {ETradeClient} from "@/lib/etradeclient";
import {cookies} from "next/headers";
import {getLoginSession} from "@/lib/sessions";
import ping from "@/lib/ping";

export async function GET(request: NextRequest)
{
    const sesh = await getLoginSession(cookies());
    await ping("auth_callback: logged in session: " + JSON.stringify(sesh));
    if (sesh.token && !sesh.half_session) {
        await ping("auth_callback: already logged in");
        return NextResponse.json({ ok: "already logged in"})
    }

    const verifier = request.nextUrl.searchParams.get("verifier");
    if (!verifier) {
        await ping("auth_callback: no verifier found");
        return new Response("No verifier found", {status: 400});
    }

    const client = new ETradeClient(sesh.token);

    const access_token = await client.getAccessToken(verifier);
    await ping("auth_callback: got access token: " + JSON.stringify(access_token));

    sesh.token = access_token;
    sesh.half_session = false;
    await sesh.save();
    await ping("auth_callback: saved session: " + JSON.stringify(sesh));

    // TODO: remove this commented out code
    // const foo = await client.getAccounts(sesh.access_token, sesh.access_secret);
    // await ping("auth_callback: got accounts: " + JSON.stringify(foo));

    return NextResponse.json({ ok: "ok"})
}
