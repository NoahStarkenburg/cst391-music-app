// app/edit/[albumId]/page.tsx
"use client";

import { get } from "@/lib/apiClient";
import { Album, Track } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditAlbumPage() {
    const router = useRouter();
    // Next.js params hook replaces useParams from react-router
    const params = useParams();
    const albumId = params?.albumId; // undefined under /new
    const defaultAlbum: Album = {
        id: 0,
        title: "",
        artist: "",
        description: "",
        year: 0,
        image: "",
        tracks: [] as Track[],
    };

    // Type safe use of defaultAlbum to initialize state
    // Rather than the ad hoc album object used previously, this ensures correct typing and calms TypeScript
    const [album, setAlbum] = useState(defaultAlbum);

    // Load album only when editing
    useEffect(() => {
        if (!albumId) return; // creation mode
        (async () => {
            const res = await get<Album>(`/albums/${albumId}`);
            setAlbum(res);
        })();
    }, [albumId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = albumId ? "PUT" : "POST";
        const url = albumId ? `/api/albums/${albumId}` : `/api/albums`;
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(album),
        });
        router.push("/");
    };

    const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setAlbum((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <main style={{ padding: "1rem" }}>
            <h1>{albumId ? "Edit Album" : "Create Album"}</h1>
            <form onSubmit={handleSubmit}>
                <input placeholder="Title" value={album.title} onChange={onChange("title")} />
                <input placeholder="Artist" value={album.artist} onChange={onChange("artist")} />
                <input placeholder="Year" value={album.year} onChange={onChange("year")} />
                <textarea placeholder="Description" value={album.description} onChange={onChange("description")} />
                <input placeholder="Image URL" value={album.image} onChange={onChange("image")} />
                <button type="submit">{albumId ? "Update" : "Save"}</button>
            </form>
        </main>
    );
}
