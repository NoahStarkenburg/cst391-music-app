"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { get, put } from "@/lib/apiClient";
import { Playlist } from "@/lib/types";
import NavBar from "../../../components/NavBar";

export default function EditPlaylistPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const params = useParams();
    const router = useRouter();
    const playlistId = params?.id;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!playlistId) return;
        get<Playlist>(`/playlists/${playlistId}`)
            .then((p) => { setName(p.name); setDescription(p.description ?? ""); setIsPublic(p.is_public); })
            .catch(() => setError("Playlist not found"));
    }, [playlistId]);

    if (status === "loading") return <p className="p-3">Loading...</p>;

    if (!session || !isAdmin) {
        return (
            <main>
                <NavBar />
                <div className="container mt-4">
                    <div className="alert alert-danger">Admin access required to edit playlists.</div>
                    <button className="btn btn-secondary" onClick={() => router.push("/playlists")}>Back</button>
                </div>
            </main>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await put(`/playlists/${playlistId}`, { name, description: description || null, is_public: isPublic });
            router.push(`/playlists/${playlistId}`);
        } catch {
            setError("Failed to update playlist.");
        }
    };

    return (
        <main>
            <NavBar />
            <div className="container mt-4" style={{ maxWidth: 480 }}>
                <h2>Edit Playlist</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="isPublic">Public playlist</label>
                    </div>
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary">Save</button>
                        <button type="button" className="btn btn-secondary" onClick={() => router.push(`/playlists/${playlistId}`)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
