"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user?.token) {
        const role = (res.user.role as string) || "admin";
        localStorage.setItem("gg_admin_token", res.user.token as string);
        localStorage.setItem("gg_admin_role",  role);
        toast.success("Connexion réussie");
        onClose();
        router.push(role === "gestionnaire" ? "/admin" : "/admin/dashboard");
      } else {
        toast.error("Identifiants incorrects");
      }
    } catch {
      toast.error("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in overflow-hidden">

        {/* Header */}
        <div className="bg-gray-900 px-6 pt-8 pb-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-gray-900" />
          </div>
          <h2 className="text-white font-black text-lg tracking-wide">
            GROUPE <span className="text-amber-400">GENETICS</span>
          </h2>
          <p className="text-white/40 text-xs mt-1">Connexion sécurisée</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors bg-gray-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 text-gray-900 rounded-xl font-black text-sm hover:bg-amber-400 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Connexion en cours..." : "Se connecter →"}
          </button>
        </form>

      </div>
    </div>
  );
}
