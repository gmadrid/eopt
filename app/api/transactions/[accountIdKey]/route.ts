import {NextRequest, NextResponse} from "next/server";
import {ETradeClient} from "@/lib/etradeclient";
import {getLoginSession, sessionLoggedIn} from "@/lib/sessions";
import {cookies} from "next/headers";

export async function GET(request: NextRequest,
                          {params}: { params: { accountIdKey: string } }) {
    const accountIdKey = params.accountIdKey;
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");
    if (!startDate || !endDate) {
        return NextResponse.json({error: "missing start or end date"});
    }

    const sesh = await getLoginSession(cookies());
    if (!sessionLoggedIn(sesh)) {
        return NextResponse.json({error: "not logged in"});
    }

    const client = new ETradeClient(sesh.token);
    const transactionListResponse = await client.getTransactions(accountIdKey, startDate, endDate);

    return NextResponse.json(transactionListResponse);
}
