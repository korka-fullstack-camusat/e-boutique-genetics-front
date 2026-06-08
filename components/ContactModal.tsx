"use client";
import { X, Phone, Mail, MapPin } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ContactModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Informations de contact</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Bureau Sénégal */}
          <div>
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3">
              Bureau Sénégal
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Phone size={15} className="text-amber-500 flex-shrink-0" />
                <span>+221 77 879 61 46</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Phone size={15} className="text-amber-500 flex-shrink-0" />
                <span>+220 271 7816</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Mail size={15} className="text-amber-500 flex-shrink-0" />
                <span>market@groupegenetics.com</span>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Bureau Gambie */}
          <div>
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3">
              Bureau Gambie
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 text-gray-700 text-sm">
                <MapPin size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Baraka Estate, Bakoteh</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Phone size={15} className="text-amber-500 flex-shrink-0" />
                <span>+220 271 7816</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Mail size={15} className="text-amber-500 flex-shrink-0" />
                <span>market@groupegenetics.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
