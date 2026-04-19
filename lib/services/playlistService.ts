import * as repo from "@/lib/repositories/playlistRepository";

export const getAll = (includePrivate = false) => repo.findAll(includePrivate);
export const getById = (id: number) => repo.findById(id);

export async function createPlaylist(name: string, description: string | null, isPublic: boolean) {
    if (!name || name.trim().length === 0) throw new Error("Playlist name is required");
    return repo.create(name.trim(), description, isPublic);
}

export const updatePlaylist = (id: number, name?: string, description?: string | null, isPublic?: boolean) =>
    repo.update(id, name, description, isPublic);

export const deletePlaylist = (id: number) => repo.remove(id);

export async function addSong(playlistId: number, trackId: number) {
    const playlist = await repo.findById(playlistId);
    if (!playlist) throw Object.assign(new Error("Playlist not found"), { status: 404 });
    const trackOk = await repo.trackExists(trackId);
    if (!trackOk) throw Object.assign(new Error("Track not found"), { status: 404 });
    const dupe = await repo.songExists(playlistId, trackId);
    if (dupe) throw Object.assign(new Error("Song already in playlist"), { status: 409 });
    return repo.addSong(playlistId, trackId);
}

export async function removeSong(playlistId: number, trackId: number) {
    const removed = await repo.removeSong(playlistId, trackId);
    if (!removed) throw Object.assign(new Error("Song not found in playlist"), { status: 404 });
}
