import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const trackId = url.searchParams.get("track");
  const albumSlug = url.searchParams.get("album");
  const siteUrl = url.searchParams.get("site") || "https://music.klwunder.de";

  if (!trackId && !albumSlug) {
    return new Response("Missing track or album parameter", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  // --- ALBUM SHARING ---
  if (albumSlug) {
    const { data: albumTracks, error } = await supabase
      .from("tracks")
      .select("*")
      .not("album", "is", null);

    if (error || !albumTracks || albumTracks.length === 0) {
      return new Response("Album not found", { status: 404 });
    }

    // Slugify helper
    const slugify = (t: string) =>
      t.toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const matched = albumTracks.filter((t: any) => slugify(t.album) === albumSlug);

    if (matched.length === 0) {
      return new Response("Album not found", { status: 404 });
    }

    const albumName = matched[0].album;
    const artist = matched[0].artist;
    const imageUrl = matched[0].cover_url || `${siteUrl}/favicon.png`;
    const trackCount = matched.length;
    const totalDuration = matched.reduce((s: number, t: any) => s + (t.duration || 0), 0);
    const mins = Math.floor(totalDuration / 60);
    const secs = totalDuration % 60;
    const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;
    const cleanUrl = `${siteUrl}/album/${albumSlug}`;

    const title = `${albumName} – ${artist}`;
    const description = `💿 ${albumName} von ${artist} • ${trackCount} Songs • ${durationStr} • Jetzt anhören auf Klangwunder`;

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="music.album">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="og:site_name" content="Klangwunder">
  <meta property="og:url" content="${cleanUrl}">
  <meta property="music:song_count" content="${trackCount}">
  <meta property="music:musician" content="${artist}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="theme-color" content="#8B5CF6">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0f; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; max-width: 400px; padding: 2rem; }
    .cover { width: 200px; height: 200px; border-radius: 16px; object-fit: cover; margin: 0 auto 1.5rem; box-shadow: 0 8px 32px rgba(139,92,246,0.3); }
    .title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .artist { color: #a78bfa; margin-bottom: 0.25rem; }
    .meta { color: #888; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 0.75rem 2rem; background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; text-decoration: none; border-radius: 99px; font-weight: 600; transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <img class="cover" src="${imageUrl}" alt="${albumName}">
    <div class="title">${albumName}</div>
    <div class="artist">${artist}</div>
    <div class="meta">${trackCount} Songs • ${durationStr}</div>
    <a class="btn" href="${cleanUrl}">💿 Album anhören</a>
  </div>
  <script>
    const bots = /bot|crawl|spider|preview|embed|discord|telegram|slack|whatsapp|facebook|twitter|linkedin/i;
    if (!bots.test(navigator.userAgent)) {
      window.location.href = "${cleanUrl}";
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
    });
  }

  // --- TRACK SHARING (existing) ---
  const { data: track, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", trackId)
    .single();

  if (error || !track) {
    return new Response("Track not found", { status: 404 });
  }

  const slug = track.title
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const title = `${track.title} – ${track.artist}`;
  const description = track.album
    ? `🎵 ${track.title} vom Album "${track.album}" • Jetzt anhören auf Klangwunder`
    : `🎵 ${track.title} von ${track.artist} • Jetzt anhören auf Klangwunder`;
  const imageUrl = track.cover_url || `${siteUrl}/favicon.png`;
  const duration = track.duration || 0;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const cleanUrl = `${siteUrl}/track/${slug}`;

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="music.song">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="og:site_name" content="Klangwunder">
  <meta property="og:url" content="${cleanUrl}">
  <meta property="music:duration" content="${duration}">
  ${track.album ? `<meta property="music:album" content="${track.album}">` : ""}
  <meta property="music:musician" content="${track.artist}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="theme-color" content="#8B5CF6">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0f; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; max-width: 400px; padding: 2rem; }
    .cover { width: 200px; height: 200px; border-radius: 16px; object-fit: cover; margin: 0 auto 1.5rem; box-shadow: 0 8px 32px rgba(139,92,246,0.3); }
    .title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .artist { color: #a78bfa; margin-bottom: 0.25rem; }
    .meta { color: #888; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 0.75rem 2rem; background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; text-decoration: none; border-radius: 99px; font-weight: 600; transition: transform 0.2s; }
    .btn:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <img class="cover" src="${imageUrl}" alt="${track.title}">
    <div class="title">${track.title}</div>
    <div class="artist">${track.artist}</div>
    <div class="meta">${track.album ? `${track.album} • ` : ""}${durationStr}</div>
    <a class="btn" href="${cleanUrl}">🎧 Jetzt anhören</a>
  </div>
  <script>
    const bots = /bot|crawl|spider|preview|embed|discord|telegram|slack|whatsapp|facebook|twitter|linkedin/i;
    if (!bots.test(navigator.userAgent)) {
      window.location.href = "${cleanUrl}";
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
  });
});
