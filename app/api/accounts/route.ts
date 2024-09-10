import {NextRequest, NextResponse} from "next/server";
import {ETradeClient} from "@/lib/etradeclient";
import {getLoginSession} from "@/lib/sessions";
import {cookies} from "next/headers";
import ping from "@/lib/ping";

export async function GET(request: NextRequest) {
    const sesh = await getLoginSession(cookies());
    if (!sesh.token || sesh.half_session) {
        return NextResponse.json({ error: "not logged in" });
    }
    await ping("accounts: logged in session: " + JSON.stringify(sesh));

    const client = new ETradeClient(sesh.token);
    const thing = await client.getAccounts();
    await ping("accounts: got accounts: " + JSON.stringify(thing));

    return NextResponse.json(thing);
}