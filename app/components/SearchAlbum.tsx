'use client';

import { Album } from '@/lib/types';
import SearchForm from './SearchForm';
import AlbumList from './AlbumList';

interface SearchAlbumProps {
    updateSearchResults: (phrase: string) => void;
    albumList: Album[];
    updateSingleAlbum: (albumId: number, uri: string) => void;
}

const SearchAlbum = (props: SearchAlbumProps) => {
    console.log('props with update single album ', props);
    return (
        <div className='container'>
            <SearchForm onSubmit={props.updateSearchResults} />
            <AlbumList albumList={props.albumList} onClick={props.updateSingleAlbum} />
        </div>
    );
};

export default SearchAlbum;
