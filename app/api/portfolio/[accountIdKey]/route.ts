import {NextRequest, NextResponse} from "next/server";
import {getLoginSession, sessionLoggedIn} from "@/lib/sessions";
import {cookies} from "next/headers";
import {ETradeClient} from "@/lib/etradeclient";

export async function GET(request: NextRequest,
                          {params}: { params: { accountIdKey: string } }) {
    const accountIdKey = params.accountIdKey;

    const sesh = await getLoginSession(cookies());
    if (!sessionLoggedIn(sesh)) {
        return NextResponse.json({error: "not logged in"});
    }

    const client = new ETradeClient(sesh.token);
    const thing = await client.getPortfolio(accountIdKey);
    return NextResponse.json(thing);
}
