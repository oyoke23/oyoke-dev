import type { APIRoute } from "astro";
import { generateOpenGraphImage } from "astro-og-canvas";
import { site } from "../lib/site";

export const GET: APIRoute = async () => {
  const png = await generateOpenGraphImage({
    title: site.title,
    description: site.description,
    bgGradient: [
      [10, 10, 10],
      [20, 15, 35],
    ],
    border: { color: [167, 139, 250], width: 4, side: "inline-start" },
    padding: 80,
    font: {
      title: { color: [245, 245, 245], size: 72, weight: "Normal" },
      description: { color: [163, 163, 163], size: 28, lineHeight: 1.4 },
    },
    format: "PNG",
  });
  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
};
