"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Upload Report", href: "/dashboard/upload" },
  { label: "My Reports", href: "/dashboard/reports" },
  { label: "Health Trends", href: "/dashboard/trends" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-teal-900 text-white">
      <div className="px-6 py-6 border-b border-teal-700">
        <h1 className="text-xl font-bold tracking-wide">Medical Insight AI</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navLinks.map(({ label, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-700 text-white"
                  : "text-teal-100 hover:bg-teal-800 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-teal-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-teal-100 hover:bg-teal-800 hover:text-white transition-colors text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
