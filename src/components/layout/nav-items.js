import { Folder, House, Image as ImageIcon, Video, WandSparkles } from "lucide-react";

/**
 * Primary navigation. `view` items switch the workspace feed (no page load),
 * `href` items are real routes, `overlay` items open an app-wide panel.
 */
export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: House, view: "all" },
  { id: "image", label: "Images", icon: ImageIcon, view: "image" },
  { id: "video", label: "Videos", icon: Video, view: "video" },
  { id: "studio", label: "Studio", icon: WandSparkles, href: "/studio" },
  { id: "assets", label: "Assets", icon: Folder, overlay: "library" },
];
