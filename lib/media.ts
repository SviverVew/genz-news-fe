/**
 * Convert API-provided asset paths (often `/uploads/...`) into full URLs.
 * Backend thumbnails may be returned as relative paths, so using them directly
 * makes the browser request them from the frontend host (causing 404).
 */
export const toAssetUrl = (maybeUrl?: string | null) => {
  if (!maybeUrl) return maybeUrl ?? undefined;

  // If it's already absolute, keep it.
  if (typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
    return maybeUrl;
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "") || "";

  // Backend usually returns `/uploads/...` (starts with `/`)
  if (maybeUrl.startsWith("/")) {
    return apiBase ? `${apiBase}${maybeUrl}` : maybeUrl;
  }

  // Backend sometimes returns `uploads/...` (no leading `/`)
  if (maybeUrl.startsWith("uploads/")) {
    return apiBase ? `${apiBase}/${maybeUrl}` : maybeUrl;
  }

  return maybeUrl;
};

