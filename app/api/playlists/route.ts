import { NextRequest, NextResponse } from "next/server";
import * as playlistService from "@/lib/services/playlistService";
import { getSession, requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await getSession();
        const includePrivate = !!session;
        const playlists = await playlistService.getAll(includePrivate);
        return NextResponse.json(playlists);
    } catch (e) {
        console.error("GET /api/playlists", e);
        return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireUser();
    if (auth instanceof NextResponse) return auth;

    try {
        const { name, description, is_public } = await request.json();
        const playlist = await playlistService.createPlaylist(name, description ?? null, is_public ?? false);
        return NextResponse.json(playlist, { status: 201 });
    } catch (e: any) {
        console.error("POST /api/playlists", e);
        const msg = e?.message ?? "Failed to create playlist";
        return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 400 : 500 });
    }
}
