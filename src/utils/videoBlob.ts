import { useEffect, useState } from 'react';

/*
 * The published host (AI Studio) ignores HTTP Range requests: it always answers 200 with the
 * whole file. iPhone Safari refuses to play <video> from such a server, so videos stay on their
 * poster. Workaround: download each video in full, then play it from a blob: URL, which Safari
 * plays without range support. Each file is fetched once and shared by every component.
 */

const cache = new Map<string, Promise<string>>();

export function loadVideo(src: string): Promise<string> {
  let pending = cache.get(src);
  if (!pending) {
    pending = fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => URL.createObjectURL(blob))
      // If the download fails, fall back to the plain URL (fine on hosts that support ranges)
      .catch(() => src);
    cache.set(src, pending);
  }
  return pending;
}

/** Returns a playable URL for `src` once it has been downloaded (undefined until then, or when `enabled` is false). */
export function useVideoUrl(src: string | undefined, enabled = true): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!src || !enabled) return;
    let cancelled = false;
    loadVideo(src).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [src, enabled]);
  return url;
}
