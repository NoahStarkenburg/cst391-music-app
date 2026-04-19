import { NextRequest, NextResponse } from "next/server";
import * as playlistService from "@/lib/services/playlistService";
import { getSession, requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const playlistId = parseInt(id, 10);
    if (isNaN(playlistId)) return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });

    try {
        const playlist = await playlistService.getById(playlistId);
        if (!playlist) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });

        if (!playlist.is_public) {
            const session = await getSession();
            if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json(playlist);
    } catch (e) {
        console.error(`GET /api/playlists/${playlistId}`, e);
        return NextResponse.json({ error: "Failed to fetch playlist" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    const playlistId = parseInt(id, 10);
    if (isNaN(playlistId)) return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });

    try {
        const { name, description, is_public } = await request.json();
        const updated = await playlistService.updatePlaylist(playlistId, name, description, is_public);
        if (!updated) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (e) {
        console.error(`PUT /api/playlists/${playlistId}`, e);
        return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    const playlistId = parseInt(id, 10);
    if (isNaN(playlistId)) return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });

    try {
        const deleted = await playlistService.deletePlaylist(playlistId);
        if (!deleted) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
        return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
    } catch (e) {
        console.error(`DELETE /api/playlists/${playlistId}`, e);
        return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 });
    }
}
