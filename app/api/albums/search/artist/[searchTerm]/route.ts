import { NextRequest, NextResponse } from "next/server";
import * as albumService from "@/lib/services/albumService";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, context: { params: Promise<{ searchTerm: string }> }) {
    const { searchTerm } = await context.params;
    try {
        const albums = await albumService.searchByArtist(searchTerm);
        return NextResponse.json(albums);
    } catch (e) {
        console.error(`GET /api/albums/search/artist/${searchTerm}`, e);
        return NextResponse.json({ error: "Failed to search albums" }, { status: 500 });
    }
}
