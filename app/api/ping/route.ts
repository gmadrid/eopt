import {NextRequest} from "next/server";

// TODO: probably delete this.
export async function GET(request: NextRequest) {
    const msg = request.nextUrl.searchParams.get("m");
    console.log("PING", msg);
    return new Response();
}
