import { NextRequest, NextResponse } from "next/server";
import * as playlistService from "@/lib/services/playlistService";
import { requireUser } from "@/lib/auth";

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string; trackId: string }> }) {
    const auth = await requireUser();
    if (auth instanceof NextResponse) return auth;

    const { id, trackId } = await context.params;
    const playlistId = parseInt(id, 10);
    const trackIdNum = parseInt(trackId, 10);
    if (isNaN(playlistId) || isNaN(trackIdNum)) {
        return NextResponse.json({ error: "Invalid playlist ID or track ID" }, { status: 400 });
    }

    try {
        await playlistService.removeSong(playlistId, trackIdNum);
        return NextResponse.json({ message: `Track ${trackIdNum} removed from playlist ${playlistId}` });
    } catch (e: any) {
        console.error(`DELETE /api/playlists/${playlistId}/songs/${trackIdNum}`, e);
        const status = e?.status ?? 500;
        return NextResponse.json({ error: e?.message ?? "Failed to remove song" }, { status });
    }
}
