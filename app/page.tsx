// app/page.tsx
// CHANGED: Next.js uses TypeScript and server/client separation.
// This component uses hooks and interactivity, so we must mark it as a Client Component.
"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Album } from "@/lib/types";
import { get } from "@/lib/apiClient";
import NavBar from "./components/NavBar";
// import AlbumCard from "./components/AlbumCard";
import SearchAlbum from "./components/SearchAlbum"; // CHANGED: adjust import paths for /app structure
// import AlbumList from "./components/AlbumList";
// import EditAlbum from "../components/EditAlbum";
// import OneAlbum from "../components/OneAlbum";
// import dataSource from "../lib/dataSource"; // CHANGED: move dataSource to /lib for Next.js convention
import { useRouter } from "next/navigation"; // CHANGED: replace BrowserRouter + navigate() with Next.js router

// CHANGED: In Next.js, "App" is replaced by a route-level component called page.tsx
export default function Page() {
  const [searchPhrase, setSearchPhrase] = useState("");
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [currentlySelectedAlbumId, setCurrentlySelectedAlbumId] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // CHANGED: replaces BrowserRouter + navigate()

  // CHANGED: Load albums from API using apiClient instead of direct fetch
  const loadAlbums = async () => {
    try {
      const data = await get<Album[]>("/albums");
      console.log("Fetched albums:", data);
      setAlbumList(data);
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  };

  // CHANGED: Initialization logic still valid
  useEffect(() => {
    loadAlbums();
  }, []);

  const updateSearchResults = async (phrase: string) => {
    console.log("phrase is " + phrase);
    setSearchPhrase(phrase);
  };

  // CHANGED: replace navigate() with router.push()
  const updateSingleAlbum = (albumId: number, uri: string) => {
    console.log("Update Single Album = ", albumId);
    const indexNumber = albumList.findIndex((a) => a.id === albumId);
    setCurrentlySelectedAlbumId(indexNumber);
    const path = `${uri}${albumId}`;
    console.log("path", path);
    router.push(path); // CHANGED: use Next.js router
  };

  const renderedList = albumList.filter((album) => {
    if (
      (album.description ?? "").toLowerCase().includes(searchPhrase.toLowerCase()) ||
      searchPhrase === ""
    ) {
      return true;
    }
    return false;
  });

  const onEditAlbum = () => {
    loadAlbums();
    router.push("/"); // CHANGED: replaced navigate("/") with router.push("/")
  };

  // CHANGED: Next.js doesn't use BrowserRouter/Routes — navigation handled via <Link> or router.push().
  // We'll show components conditionally based on app state or via separate pages in /app.
  // For demo, this page shows the search UI by default.
  return (
    <main>
      <NavBar />
      {/* CHANGED: Render SearchAlbum directly here; other routes (new, edit, show)
          will be separate pages: /new/page.tsx, /edit/[albumId]/page.tsx, etc. */}
      <SearchAlbum
        updateSearchResults={updateSearchResults}
        albumList={renderedList}
        updateSingleAlbum={(albumId: number, uri: string) => updateSingleAlbum(albumId, uri)}
      />

      {/* Show error message if API call fails */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* CHANGED: simple conditional view */}
      {albumList.length === 0 && !error && <p>Loading albums...</p>}
    </main>
  );
}
