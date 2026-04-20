import { NextRequest, NextResponse } from "next/server";
import * as playlistService from "@/lib/services/playlistService";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const auth = await requireUser();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    const playlistId = parseInt(id, 10);
    if (isNaN(playlistId)) return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });

    try {
        const { track_id } = await request.json();
        const trackId = parseInt(track_id, 10);
        if (isNaN(trackId)) return NextResponse.json({ error: "Valid track_id is required" }, { status: 400 });

        const song = await playlistService.addSong(playlistId, trackId);
        return NextResponse.json(song, { status: 201 });
    } catch (e: any) {
        console.error(`POST /api/playlists/${playlistId}/songs`, e);
        const status = e?.status ?? 500;
        return NextResponse.json({ error: e?.message ?? "Failed to add song" }, { status });
    }
}
