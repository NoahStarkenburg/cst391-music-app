"use client";

import { Album } from "@/lib/types";
import { useSession } from "next-auth/react";

interface AlbumCardProps {
    album: Album;
    onClick: (album: Album, uri: string) => void;
}

export default function AlbumCard({ album, onClick }: AlbumCardProps) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const isLoggedIn = !!session;

    const handleButtonClick = (uri: string) => {
        onClick(album, uri);
    };

    return (
        <div className='col-sm-4 mb-3'>
        <div className='card'>
            {album.image && <img src={album.image} className='card-img-top' alt='Album Cover' />}
            <div className='card-body'>
                <h5 className='card-title'>{album.title}</h5>
                <p className='card-text'>{album.description}</p>
                {isLoggedIn && (
                    <button
                        onClick={() => handleButtonClick('/show/')}
                        className='btn btn-primary me-2'
                    >
                        View
                    </button>
                )}
                {isAdmin && (
                    <button
                        onClick={() => handleButtonClick('/edit/')}
                        className='btn btn-secondary'
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
        </div>
    );
}
