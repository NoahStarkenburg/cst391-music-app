"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { get, post, del } from "@/lib/apiClient";
import { Playlist, Album } from "@/lib/types";
import NavBar from "../../components/NavBar";
import Link from "next/link";

export default function PlaylistPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const isLoggedIn = !!session;

    const params = useParams();
    const router = useRouter();
    const playlistId = params?.id;

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [selectedAlbumId, setSelectedAlbumId] = useState<number | "">("");
    const [selectedTrackId, setSelectedTrackId] = useState<number | "">("");
    const [error, setError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    const loadPlaylist = async () => {
        try {
            const data = await get<Playlist>(`/playlists/${playlistId}`);
            setPlaylist(data);
            setError(null);
        } catch (e: any) {
            setError(e?.message?.includes("401") ? "Sign in to view this private playlist." : "Playlist not found.");
        }
    };

    useEffect(() => {
        if (!playlistId) return;
        loadPlaylist();
        if (isLoggedIn) {
            get<Album[]>("/albums").then(setAlbums).catch(() => {});
        }
    }, [playlistId, isLoggedIn]);

    const handleAddSong = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError(null);
        if (!selectedTrackId) return;
        try {
            await post(`/playlists/${playlistId}/songs`, { track_id: selectedTrackId });
            setSelectedAlbumId("");
            setSelectedTrackId("");
            await loadPlaylist();
        } catch (e: any) {
            setAddError(e?.message ?? "Failed to add song");
        }
    };

    const handleRemoveSong = async (trackId: number) => {
        try {
            await del(`/playlists/${playlistId}/songs/${trackId}`);
            await loadPlaylist();
        } catch {
            alert("Failed to remove song");
        }
    };

    const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);

    if (error) {
        return (
            <main>
                <NavBar />
                <div className="container mt-4">
                    <div className="alert alert-warning">{error}</div>
                    <Link href="/playlists" className="btn btn-secondary">Back to Playlists</Link>
                </div>
            </main>
        );
    }

    if (!playlist) return <p className="p-3">Loading...</p>;

    return (
        <main>
            <NavBar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h2>{playlist.name}</h2>
                        <span className={`badge ${playlist.is_public ? "bg-success" : "bg-secondary"} mb-2`}>
                            {playlist.is_public ? "Public" : "Private"}
                        </span>
                        {playlist.description && <p className="text-muted">{playlist.description}</p>}
                    </div>
                    <div className="d-flex gap-2">
                        {isAdmin && (
                            <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/playlists/${playlistId}/edit`)}>
                                Edit
                            </button>
                        )}
                        <Link href="/playlists" className="btn btn-outline-secondary btn-sm">Back</Link>
                    </div>
                </div>

                <h5>Songs ({playlist.songs?.length ?? 0})</h5>
                {(!playlist.songs || playlist.songs.length === 0) && (
                    <p className="text-muted">No songs yet.</p>
                )}
                <ul className="list-group mb-4">
                    {playlist.songs?.map((s) => (
                        <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                <strong>{s.position}.</strong> {s.track_title}{" "}
                                <span className="text-muted small">— {s.artist}, {s.album_title}</span>
                            </span>
                            {isLoggedIn && (
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveSong(s.track_id)}
                                >
                                    Remove
                                </button>
                            )}
                        </li>
                    ))}
                </ul>

                {isLoggedIn && (
                    <div className="card p-3 mb-4">
                        <h6>Add a Song</h6>
                        {addError && <div className="alert alert-danger py-1">{addError}</div>}
                        <form onSubmit={handleAddSong} className="row g-2 align-items-end">
                            <div className="col-sm-4">
                                <label className="form-label small">Album</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedAlbumId}
                                    onChange={(e) => { setSelectedAlbumId(Number(e.target.value)); setSelectedTrackId(""); }}
                                >
                                    <option value="">Select album…</option>
                                    {albums.map((a) => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-sm-4">
                                <label className="form-label small">Track</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedTrackId}
                                    onChange={(e) => setSelectedTrackId(Number(e.target.value))}
                                    disabled={!selectedAlbumId}
                                >
                                    <option value="">Select track…</option>
                                    {selectedAlbum?.tracks?.map((t) => (
                                        <option key={t.id} value={t.id}>{t.number}. {t.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-sm-2">
                                <button type="submit" className="btn btn-success btn-sm w-100" disabled={!selectedTrackId}>
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
