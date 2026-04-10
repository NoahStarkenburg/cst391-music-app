// app/page.tsx
// CHANGED: Next.js uses TypeScript and server/client separation.
// This component uses hooks and interactivity, so we must mark it as a Client Component.
"use client";

import { useState, useEffect } from "react";
import { Album } from "@/lib/types";
import NavBar from "./components/NavBar";
// import SearchAlbum from "../components/SearchAlbum"; // CHANGED: adjust import paths for /app structure
// import EditAlbum from "../components/EditAlbum";
// import OneAlbum from "../components/OneAlbum";
// import dataSource from "../lib/dataSource"; // CHANGED: move dataSource to /lib for Next.js convention
import { useRouter } from "next/navigation"; // CHANGED: replace BrowserRouter + navigate() with Next.js router

// CHANGED: In Next.js, "App" is replaced by a route-level component called page.tsx
export default function Page() {
  const [searchPhrase, setSearchPhrase] = useState("");
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [currentlySelectedAlbumId, setCurrentlySelectedAlbumId] = useState(0);

  const router = useRouter(); // CHANGED: replaces BrowserRouter + navigate()

  // CHANGED: Load albums from API (fetch through relative path, not axios)
  const loadAlbums = async () => {
    // CHANGED: since the server and client are in the same Next.js app, we can use relative paths
    const response = await fetch("/api/albums");
    const data = await response.json();
    console.log("Fetched albums:", data);
    setAlbumList(data);
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
    const path = `${uri}${indexNumber}`;
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
      {/* <SearchAlbum
        updateSearchResults={updateSearchResults}
        albumList={renderedList}
        updateSingleAlbum={(albumid: number) => updateSingleAlbum(albumid, "/show/")}
      /> */}

      <h1>Noah Starkenburg&apos;s Album List (Debug View)</h1>
      <p>This JSON data is rendered directly from the API response.</p>

      {/* CHANGED: render JSON data inline */}
      <pre
        style={{
          backgroundColor: "#f4f4f4",
          padding: "1rem",
          borderRadius: "8px",
          overflow: "auto",
          color: "#111",
          fontSize: "0.9rem",
          lineHeight: "1.4",
        }}
      >
        {albumList.length > 0 && JSON.stringify(albumList, null, 2)}
      </pre>

      {/* CHANGED: simple conditional view */}
      {albumList.length === 0 && <p>Loading albums...</p>}
    </main>
  );
}
