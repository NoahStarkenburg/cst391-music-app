import { NextResponse } from "next/server";
import * as artistService from "@/lib/services/artistService";

export const runtime = "nodejs";

export async function GET() {
    try {
        const artists = await artistService.getAll();
        return NextResponse.json(artists);
    } catch (e) {
        console.error("GET /api/artists", e);
        return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
    }
}
