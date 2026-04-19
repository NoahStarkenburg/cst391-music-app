"use client";

import { get, post, put } from "@/lib/apiClient";
import { Album, Track } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function EditAlbumPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const router = useRouter();
    const params = useParams();
    const albumId = params?.albumId;

    const defaultAlbum: Album = { id: 0, title: "", artist: "", description: "", year: 0, image: "", tracks: [] as Track[] };
    const [album, setAlbum] = useState(defaultAlbum);

    useEffect(() => {
        if (!albumId) return;
        (async () => {
            const res = await get<Album>(`/albums/${albumId}`);
            setAlbum(res);
        })();
    }, [albumId]);

    if (status === "loading") return <p className="p-3">Loading...</p>;

    if (!session || !isAdmin) {
        return (
            <main className="container mt-4">
                <div className="alert alert-danger">Admin access required to manage albums.</div>
                <button className="btn btn-secondary" onClick={() => router.push("/")}>Back to Home</button>
            </main>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (albumId) {
            await put<Album, Album>(`/albums/${albumId}`, album);
        } else {
            await post<Album, Album>("/albums", album);
        }
        router.push("/");
    };

    const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setAlbum((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <main className="container mt-4" style={{ maxWidth: 480 }}>
            <h1>{albumId ? "Edit Album" : "Create Album"}</h1>
            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <input className="form-control" placeholder="Title" value={album.title} onChange={onChange("title")} required />
                </div>
                <div className="mb-3">
                    <input className="form-control" placeholder="Artist" value={album.artist} onChange={onChange("artist")} required />
                </div>
                <div className="mb-3">
                    <input className="form-control" placeholder="Year" value={album.year} onChange={onChange("year")} />
                </div>
                <div className="mb-3">
                    <textarea className="form-control" placeholder="Description" value={album.description ?? ""} onChange={onChange("description")} rows={3} />
                </div>
                <div className="mb-3">
                    <input className="form-control" placeholder="Image URL" value={album.image ?? ""} onChange={onChange("image")} />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">{albumId ? "Update" : "Save"}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => router.push("/")}>Cancel</button>
                </div>
            </form>
        </main>
    );
}
