"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, LogOut, Menu, X, Package, Users } from "lucide-react";
import Link from "next/link";

type NavItem = { href: string; label: string; icon: React.ElementType };

const NAV_FULL: NavItem[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin",           label: "Produits",        icon: Package },
  { href: "/admin/orders",    label: "Commandes",       icon: ShoppingCart },
  { href: "/admin/accounts",  label: "Gestion comptes", icon: Users },
];

const NAV_GESTIONNAIRE: NavItem[] = [
  { href: "/admin", label: "Produits", icon: Package },
];

// Pages accessibles uniquement aux admins complets
const ADMIN_ONLY_PATHS = [
  "/admin/dashboard",
  "/admin/orders",
  "/admin/surveys",
  "/admin/accounts",
];

function SidebarBrand({ subtitle }: { subtitle: string }) {
  return (
    <Link href="/" className="flex items-center gap-3 px-5 py-5 border-b border-white/10 group">
      <div>
        <p className="font-black text-sm text-white tracking-wide group-hover:text-amber-400 transition-colors">
          GROUPE <span className="text-amber-400">GENETICS</span>
        </p>
        <p className="text-[11px] text-white/35 mt-0.5">{subtitle}</p>
      </div>
    </Link>
  );
}

function SidebarNav({ items, onNav }: { items: NavItem[]; onNav?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-4 space-y-0.5 px-3">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNav}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === href
              ? "bg-amber-500/20 text-amber-400 border-l-2 border-amber-400"
              : "text-white/55 hover:text-white hover:bg-white/5"
          }`}
        >
          <Icon size={17} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [authed, setAuthed]           = useState<boolean | null>(null);
  const [role,   setRole]             = useState<string>("admin");
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  // Auth + rôle
  useEffect(() => {
    const token = localStorage.getItem("gg_admin_token");
    if (!token) { router.replace("/"); return; }
    const storedRole = localStorage.getItem("gg_admin_role") || "admin";
    setRole(storedRole);
    setAuthed(true);
  }, [router]);

  // Protection des pages réservées aux admins
  useEffect(() => {
    if (!authed) return;
    if (role === "gestionnaire" && ADMIN_ONLY_PATHS.includes(pathname)) {
      router.replace("/admin");
    }
  }, [authed, role, pathname, router]);

  function confirmLogout() {
    localStorage.removeItem("gg_admin_token");
    localStorage.removeItem("gg_admin_role");
    router.replace("/");
  }

  if (authed === null) return null;

  const navItems  = role === "gestionnaire" ? NAV_GESTIONNAIRE : NAV_FULL;
  const subtitle  = role === "gestionnaire" ? "Gestion des produits" : "Espace Administration";

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sidebar desktop ────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col bg-gray-900 text-white flex-shrink-0">
        <SidebarBrand subtitle={subtitle} />
        <SidebarNav items={navItems} />
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={() => setLogoutModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-white/40 hover:text-red-400 text-sm font-medium transition-colors rounded-xl hover:bg-red-400/10"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-black text-sm text-white">
                GROUPE <span className="text-amber-400">GENETICS</span>
              </span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} className="text-white/50" />
              </button>
            </div>
            <SidebarNav items={navItems} onNav={() => setMobileOpen(false)} />
            <div className="px-4 py-4 border-t border-white/10">
              <button
                onClick={() => { setMobileOpen(false); setLogoutModal(true); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-white/40 hover:text-red-400 text-sm font-medium transition-colors rounded-xl hover:bg-red-400/10"
              >
                <LogOut size={16} /> Se déconnecter
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden bg-gray-900 text-white px-4 h-14 flex items-center gap-3 border-b border-white/10">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-black text-sm">
            GROUPE <span className="text-amber-400">GENETICS</span>
          </span>
        </div>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>

      {/* ── Modal confirmation déconnexion ─────────────────────────────── */}
      {logoutModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Se déconnecter ?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Vous allez quitter l'espace administration.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLogoutModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:border-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
