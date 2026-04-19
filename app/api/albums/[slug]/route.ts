import { NextRequest, NextResponse } from "next/server";
import * as albumService from "@/lib/services/albumService";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;
    try {
        const id = parseInt(slug, 10);
        if (!isNaN(id)) {
            const album = await albumService.getById(id);
            if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });
            return NextResponse.json(album);
        }
        const albums = await albumService.getByArtist(slug);
        return NextResponse.json(albums);
    } catch (e) {
        console.error(`GET /api/albums/${slug}`, e);
        return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { slug } = await context.params;
    const id = parseInt(slug, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid album ID" }, { status: 400 });

    try {
        const { title, artist, year, description, image, tracks } = await request.json();
        await albumService.updateAlbum(id, { title, artist, year, description, image }, tracks);
        return NextResponse.json({ message: "Album updated" });
    } catch (e) {
        console.error(`PUT /api/albums/${id}`, e);
        return NextResponse.json({ error: "Failed to update album" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { slug } = await context.params;
    const id = parseInt(slug, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid album ID" }, { status: 400 });

    try {
        const deleted = await albumService.deleteAlbum(id);
        if (!deleted) return NextResponse.json({ error: "Album not found" }, { status: 404 });
        return NextResponse.json({ message: `Album ${id} deleted` });
    } catch (e) {
        console.error(`DELETE /api/albums/${id}`, e);
        return NextResponse.json({ error: "Failed to delete album" }, { status: 500 });
    }
}
