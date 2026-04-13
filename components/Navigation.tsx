"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Hive", icon: "⬡" },
  { href: "/clock", label: "Hours", icon: "☉" },
  { href: "/match", label: "Match", icon: "⚷" },
  { href: "/journal", label: "Journal", icon: "☽" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-amber/20 bg-obsidian/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-wide text-amber"
        >
          Hive Grimoire
        </Link>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm transition-colors ${
                  active
                    ? "bg-amber/20 text-amber"
                    : "text-cream/60 hover:bg-amber/10 hover:text-cream"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <a
            href="https://buymeacoffee.com/napalmlighs"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1.5 rounded-lg border border-amber/30 bg-amber/10 px-3 py-1.5 font-mono text-sm text-amber transition-colors hover:bg-amber/20"
          >
            <span className="text-base">☕</span>
            <span className="hidden sm:inline">Support</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
