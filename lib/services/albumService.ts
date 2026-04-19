import * as repo from "@/lib/repositories/albumRepository";
import { Album, Track } from "@/lib/types";

export const getAll = () => repo.findAll();
export const getById = (id: number) => repo.findById(id);
export const getByArtist = (artist: string) => repo.findByArtist(artist);
export const searchByArtist = (term: string) => repo.searchByArtist(term);
export const searchByDescription = (term: string) => repo.searchByDescription(term);

export async function createAlbum(data: Omit<Album, "id">, tracks?: Track[]): Promise<number> {
    if (!data.title || !data.artist || data.year == null) throw new Error("Missing required album fields");
    return repo.create(data, tracks);
}

export const updateAlbum = (id: number, data: Partial<Album>, tracks?: Track[]) => repo.update(id, data, tracks);

export const deleteAlbum = (id: number) => repo.remove(id);
