export interface Track {
  id: number;
  album_id?: number;
  number: number;
  title: string;
  lyrics?: string | null;
  video?: string | null;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  year: number;
  image?: string | null;
  description?: string | null;
  tracks?: Track[];
}

export interface Playlist {
  id: number;
  name: string;
  description?: string | null;
  owner_user_id?: number | null;
  is_public: boolean;
  created_at: string;
  songs?: PlaylistSong[];
  song_count?: number;
}

export interface PlaylistSong {
  id: number;
  playlist_id: number;
  track_id: number;
  added_at: string;
  position: number;
  track_title?: string;
  track_number?: number;
  album_title?: string;
  artist?: string;
}
