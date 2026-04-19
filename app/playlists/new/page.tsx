"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/apiClient";
import { Playlist } from "@/lib/types";
import NavBar from "../../components/NavBar";
import Link from "next/link";

export default function NewPlaylistPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (status === "loading") return <p className="p-3">Loading...</p>;

    if (!session) {
        return (
            <main>
                <NavBar />
                <div className="container mt-4">
                    <div className="alert alert-warning">
                        You must <Link href="/api/auth/signin">sign in</Link> to create a playlist.
                    </div>
                </div>
            </main>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await post<Playlist, object>("/playlists", { name, description: description || null, is_public: isPublic });
            router.push("/playlists");
        } catch (e) {
            setError("Failed to create playlist. Please try again.");
        }
    };

    return (
        <main>
            <NavBar />
            <div className="container mt-4" style={{ maxWidth: 480 }}>
                <h2>New Playlist</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
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
                        <button type="submit" className="btn btn-success">Create</button>
                        <button type="button" className="btn btn-secondary" onClick={() => router.push("/playlists")}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
