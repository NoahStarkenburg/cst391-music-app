import { NextRequest, NextResponse } from "next/server";
import * as albumService from "@/lib/services/albumService";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const albums = await albumService.getAll();
        return NextResponse.json(albums);
    } catch (e) {
        console.error("GET /api/albums", e);
        return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    try {
        const { title, artist, year, description, image, tracks } = await request.json();
        const id = await albumService.createAlbum({ title, artist, year, description, image }, tracks);
        return NextResponse.json({ id }, { status: 201 });
    } catch (e: any) {
        console.error("POST /api/albums", e);
        const msg = e?.message ?? "Failed to create album";
        return NextResponse.json({ error: msg }, { status: msg.includes("Missing") ? 400 : 500 });
    }
}
