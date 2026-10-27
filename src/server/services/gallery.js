import "server-only";
import items from "../data/gallery.json";
import { getClientMedia } from "../media";

export function listGallery() {
  return items.map(({ mediaId, ...item }) => ({ ...item, media: getClientMedia(mediaId) }));
}
