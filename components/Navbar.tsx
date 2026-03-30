"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Discovery" },
  { href: "/queue", label: "Queue" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-charcoal flex items-center px-6 border-b border-white/10">
      <div className="flex items-center gap-2 mr-10">
        <span className="text-[9px] tracking-[0.25em] text-gold uppercase font-medium">
          HZL
        </span>
        <h1 className="font-display text-lg text-cream font-bold">
          Ryann Apply
        </h1>
      </div>
      <div className="flex gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-gold/15 text-gold font-medium"
                  : "text-cream/50 hover:text-cream hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
