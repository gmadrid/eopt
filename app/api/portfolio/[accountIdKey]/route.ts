import {NextRequest, NextResponse} from "next/server";
import {getLoginSession} from "@/lib/sessions";
import {cookies} from "next/headers";
import {ETradeClient} from "@/lib/etradeclient";

// TODO: probably delete this.
export async function GET(request: NextRequest,
                          {params}: { params: { accountIdKey: string } }) {
    const accountIdKey = params.accountIdKey;

    const sesh = await getLoginSession(cookies());
    if (!sesh.token || sesh.half_session) {
        return NextResponse.json({error: "not logged in"});
    }

    const client = new ETradeClient(sesh.token);
    const thing = await client.getPortfolio(accountIdKey);
    return NextResponse.json(thing);
}
