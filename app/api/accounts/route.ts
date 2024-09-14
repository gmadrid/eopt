import {NextRequest, NextResponse} from "next/server";
import {ETradeClient} from "@/lib/etradeclient";
import {getLoginSession} from "@/lib/sessions";
import {cookies} from "next/headers";

export async function GET(request: NextRequest) {
    const sesh = await getLoginSession(cookies());
    // TODO: move this into a class behavior.
    if (!sesh.token || sesh.half_session) {
        return NextResponse.json({error: "not logged in"});
    }

    const client = new ETradeClient(sesh.token);
    const thing = await client.getAccounts();

    return NextResponse.json(thing);
}