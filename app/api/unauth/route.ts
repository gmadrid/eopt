import {NextRequest, NextResponse} from "next/server";
import {killLoginSession} from "@/lib/sessions";
import {cookies} from "next/headers";

export async function GET(request: NextRequest) {
    killLoginSession(cookies());
    return NextResponse.json({ok: "ok"});
}

