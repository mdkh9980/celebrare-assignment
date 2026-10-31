import { useCallback, useMemo, useEffect, useReducer, useState } from "react";
import useFetchPhotos from "./hooks/useFetchPhotos";

// Load previously saved favourites from localStorage.
function loadFavourites() {
  try {
    const savedFavourites = localStorage.getItem("photo-gallery-favourites");

    if (!savedFavourites) return [];

    const parsedFavourites = JSON.parse(savedFavourites);

    return Array.isArray(parsedFavourites) ? parsedFavourites : [];
  } catch {
    return [];
  }
}

// Manage favourite photo IDs.
function favouritesReducer(favourites, action) {
  switch (action.type) {
    case "TOGGLE_FAVOURITE": {
      const photoId = action.photoId;

      if (favourites.includes(photoId)) {
        return favourites.filter((id) => id !== photoId);
      }

      return [...favourites, photoId];
    }

    default:
      return favourites;
  }
}

function HeartIcon({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      <p className="mt-4 text-sm text-gray-500">Loading photos...</p>
    </div>
  );
}

function PhotoCard({ photo, isFavourite, onToggleFavourite }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={photo.download_url}
          alt={`Photograph by ${photo.author}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <button
          type="button"
          onClick={() => onToggleFavourite(photo.id)}
          aria-label={
            isFavourite
              ? `Remove ${photo.author}'s photo from favourites`
              : `Add ${photo.author}'s photo to favourites`
          }
          aria-pressed={isFavourite}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            isFavourite
              ? "bg-white text-red-500"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
          }`}
        >
          <HeartIcon filled={isFavourite} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {photo.author}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Photo #{photo.id}
          </p>
        </div>

        {isFavourite && (
          <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-500">
            Favourite
          </span>
        )}
      </div>
    </article>
  );
}

export default function App() {
  const { photos, loading, error } = useFetchPhotos();

  const [searchTerm, setSearchTerm] = useState("");

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    loadFavourites
  );

  // Persist favourites whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        "photo-gallery-favourites",
        JSON.stringify(favourites)
      );
    } catch {
      // The app remains usable even if browser storage is unavailable.
    }
  }, [favourites]);

  // Update the search term without recreating the handler.
  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Filter the already-fetched photos without another API request.
  const filteredPhotos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return photos;
    }

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(normalizedSearch)
    );
  }, [photos, searchTerm]);

  const toggleFavourite = useCallback((photoId) => {
    dispatch({
      type: "TOGGLE_FAVOURITE",
      photoId,
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Frame<span className="text-gray-400">.</span>
            </h1>
            <p className="mt-0.5 text-xs text-gray-400">
              A little collection of moments
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <HeartIcon filled />
            <span className="text-sm font-semibold text-gray-700">
              {favourites.length}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Page introduction */}
        <section className="mb-9">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            The collection
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Discover photography.
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-gray-500">
            Explore photographs from talented creators around the world.
          </p>
        </section>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by photographer..."
              aria-label="Search photos by author"
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400"
            />
          </div>
        </div>

        {/* Gallery */}
        <section aria-label="Photo gallery">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              All photographs
            </h3>

            <span className="text-xs text-gray-400">
              {loading ? "Loading..." : `${filteredPhotos.length} photos`}
            </span>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-6 py-12 text-center"
            >
              <p className="font-semibold text-red-700">
                Something went wrong
              </p>
              <p className="mt-2 text-sm text-red-500">{error}</p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
              <p className="font-semibold text-gray-800">
                No photographs found
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Try searching with a different photographer name.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isFavourite={favourites.includes(photo.id)}
                  onToggleFavourite={toggleFavourite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 text-center sm:px-8">
          <p className="text-xs text-gray-400">
            Photography powered by{" "}
            <a
              href="https://picsum.photos/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Link
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}