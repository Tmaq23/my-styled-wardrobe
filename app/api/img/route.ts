import { NextResponse } from "next/server";

export const runtime = "edge"; // fast & cheap

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");
  
  if (!src) {
    return new NextResponse("Missing src", { status: 400 });
  }

  // Basic allowlist to prevent open proxy abuse
  const allowedHosts = [
    "images.asos-media.com",
    "lp2.hm.com",
    "static.zara.net",
    "images.topshop.com",
    "images.riverisland.com",
    "images.next.co.uk",
    "images.marksandspencer.com",
    "oaidalleapiprodscus.blob.core.windows.net", // OpenAI DALL-E images
    "picsum.photos", // Fallback placeholder images
    // add more as needed
  ];

  try {
    const url = new URL(src);
    
    if (!allowedHosts.some(h => url.hostname.endsWith(h))) {
      return new NextResponse("Host not allowed", { status: 403 });
    }

    // Set referer & user-agent to look like a browser
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    };

    // For DALL-E images, don't set referer as it might cause issues
    if (!url.hostname.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      headers["Referer"] = url.origin + "/";
    }

    const res = await fetch(url.toString(), {
      headers,
      // H&M and others sometimes require redirects
      redirect: "follow",
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse(`Upstream ${res.status}`, { status: 502 });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        // Cache aggressively at the edge
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (e) {
    console.error("Image proxy error:", e);
    return new NextResponse("Bad src", { status: 400 });
  }
}








