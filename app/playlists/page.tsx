"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { get, del } from "@/lib/apiClient";
import { Playlist } from "@/lib/types";
import NavBar from "../components/NavBar";
import Link from "next/link";

export default function PlaylistsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const isLoggedIn = !!session;
    const router = useRouter();

    const [playlists, setPlaylists] = useState<(Playlist & { song_count?: number })[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            const data = await get<(Playlist & { song_count?: number })[]>("/playlists");
            setPlaylists(data);
            setError(null);
        } catch (e) {
            setError(String(e));
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this playlist?")) return;
        try {
            await del(`/playlists/${id}`);
            setPlaylists((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            alert("Failed to delete playlist");
        }
    };

    return (
        <main>
            <NavBar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Playlists</h2>
                    {isLoggedIn && (
                        <Link href="/playlists/new" className="btn btn-success">New Playlist</Link>
                    )}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {playlists.length === 0 && !error && <p>No playlists found.</p>}

                <div className="row">
                    {playlists.map((p) => (
                        <div key={p.id} className="col-sm-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{p.name}</h5>
                                    <p className="card-text text-muted small">
                                        {p.is_public ? "Public" : "Private"} &bull; {p.song_count ?? 0} songs
                                    </p>
                                    {p.description && <p className="card-text">{p.description}</p>}
                                </div>
                                <div className="card-footer d-flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => router.push(`/playlists/${p.id}`)}
                                    >
                                        View
                                    </button>
                                    {isAdmin && (
                                        <>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => router.push(`/playlists/${p.id}/edit`)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(p.id)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
