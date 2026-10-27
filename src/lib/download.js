import { toFileName } from "./format";

/**
 * Downloads a same-origin media file with a readable file name.
 * Falls back to opening the file when the browser blocks programmatic downloads.
 */
export async function downloadMedia(media, label) {
  const extension = media.type === "video" ? "mp4" : media.src.split(".").pop() || "webp";
  const fileName = toFileName(label, extension);
  try {
    const response = await fetch(media.src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    window.open(media.src, "_blank", "noopener");
    return false;
  }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
