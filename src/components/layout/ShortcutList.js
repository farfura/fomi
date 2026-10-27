import { Kbd } from "@/components/ui/Kbd";

const SHORTCUTS = [
  { keys: ["/"], label: "Focus the prompt" },
  { keys: ["Ctrl", "Enter"], label: "Generate (⌘ Enter on Mac)" },
  { keys: ["←", "→"], label: "Browse in the viewer" },
  { keys: ["Esc"], label: "Close panels" },
  { keys: ["N"], label: "Studio: pin a note" },
  { keys: ["C"], label: "Studio: compare with parent" },
  { keys: ["A"], label: "Studio: approve take" },
];

export function ShortcutList() {
  return (
    <dl className="space-y-1.5">
      {SHORTCUTS.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-6 text-xs">
          <dt className="text-muted">{item.label}</dt>
          <dd className="flex gap-1">
            {item.keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
