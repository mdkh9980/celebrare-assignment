import { useEffect, useState } from "react";

const PHOTOS_API = import.meta.env.VITE_PHOTOS_API

export default function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPhotos() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(PHOTOS_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to fetch photos. Please try again.");
        }

        const data = await response.json();

        setPhotos(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong while fetching photos.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPhotos();

    return () => {
      controller.abort();
    };
  }, []);

  return { photos, loading, error };
}