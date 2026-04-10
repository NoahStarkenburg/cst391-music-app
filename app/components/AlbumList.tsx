'use client';

import { Album } from '@/lib/types';
import AlbumCard from './AlbumCard';

interface AlbumListProps {
    albumList: Album[];
    onClick: (albumId: number, uri: string) => void;
}

const AlbumList = (props: AlbumListProps) => {
    const handleSelectionOne = (album: Album, uri: string) => {
        console.log('Selected ID is ' + album.id);
        props.onClick(album.id, uri);
    };

    console.log('props albumList', props);
    const albums = props.albumList.map((album) => {
        return (
            <AlbumCard
                key={album.id}
                album={album}
                onClick={handleSelectionOne}
            />
        );
    });
    return <div className='container'><div className='row'>{albums}</div></div>;
};

export default AlbumList;
