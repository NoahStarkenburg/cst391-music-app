// app/show/[albumId]/page.tsx
// Suggested improvement: reuse the edit component as a read-only view.
// No albumId editing — displays album details with only a Home button.
"use client";

import { get } from "@/lib/apiClient";
import { Album } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ShowAlbumPage() {
    const router = useRouter();
    const params = useParams();
    const albumId = params?.albumId;

    const [album, setAlbum] = useState<Album | null>(null);

    useEffect(() => {
        if (!albumId) return;
        (async () => {
            const res = await get<Album>(`/albums/${albumId}`);
            setAlbum(res);
        })();
    }, [albumId]);

    if (!album) return <p className="p-3">Loading...</p>;

    return (
        <main className="container mt-4">
            <div className="row">
                <div className="col-sm-3">
                    <div className="card">
                        {album.image && (
                            <img src={album.image} className="card-img-top" alt={album.title} />
                        )}
                        <div className="card-body">
                            <h5 className="card-title">{album.title}</h5>
                            <p className="card-text">{album.description}</p>
                            <div className="list-group">
                                {album.tracks?.map((track) => (
                                    <li key={track.id} className="list-group-item">
                                        {track.number}. {track.title}
                                    </li>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-9">
                    <div className="card p-3 mb-3">
                        <h6>Artist</h6>
                        <p>{album.artist}</p>
                        <h6>Year</h6>
                        <p>{album.year}</p>
                    </div>
                </div>
            </div>
            <button className="btn btn-primary mt-3" onClick={() => router.push("/")}>
                Home
            </button>
        </main>
    );
}
