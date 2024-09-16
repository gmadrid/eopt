import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {
    const msg = request.nextUrl.searchParams.get("m");
    console.log(`PING: ${msg}`);
    return new Response();
}
