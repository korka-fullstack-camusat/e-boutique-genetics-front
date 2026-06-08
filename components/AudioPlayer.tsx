"use client";
import { useState, useEffect } from "react";
import { Music, VolumeX } from "lucide-react";

const VIDEO_ID = "FqzpkVPR478";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// ── State module-level — jamais de closure stale ───────────────────────────
let _player:  any     = null;
let _ready            = false;
let _activated        = false; // true dès que le navigateur a accepté l'unmute

function _activate() {
  if (_activated || !_ready || !_player) return;
  if (typeof localStorage !== "undefined" &&
      localStorage.getItem("gg_music") === "off") return;
  try {
    _player.unMute();
    _player.setVolume(30);
    _activated = true;
  } catch (_) { /* silencieux */ }
}

export function AudioPlayer() {
  const [active,  setActive]  = useState(false);  // son en cours
  const [paused,  setPaused]  = useState(false);  // l'user a pausé
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Init YouTube ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const initPlayer = () => {
      if (_player) return;
      _player = new window.YT.Player("gg-yt-player", {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1, mute: 1, loop: 1,
          playlist: VIDEO_ID, controls: 0,
          disablekb: 1, fs: 0, rel: 0,
          modestbranding: 1, playsinline: 1,
        },
        events: {
          onReady() {
            _ready = true;
            if (localStorage.getItem("gg_music") === "off") {
              _player.pauseVideo();
              setPaused(true);
              return;
            }
            // Si un clic est déjà arrivé avant que le player soit prêt
            if (_activated) {
              _player.unMute();
              _player.setVolume(30);
              setActive(true);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        s.async = true;
        document.head.appendChild(s);
      }
    }
  }, [mounted]);

  // ── Écoute les vrais événements de confiance du navigateur ─────────────
  // mousedown / touchstart / keydown = trusted user activation events
  // (mousemove et scroll NE SONT PAS acceptés par les navigateurs)
  useEffect(() => {
    if (!mounted) return;

    function onTrustedEvent() {
      if (_activated) return; // déjà activé
      _activate();
      if (_activated) {
        setActive(true);
        // Retire les listeners — plus besoin
        document.removeEventListener("mousedown",  onTrustedEvent, true);
        document.removeEventListener("touchstart", onTrustedEvent, true);
        document.removeEventListener("touchend",   onTrustedEvent, true);
        document.removeEventListener("keydown",    onTrustedEvent, true);
      }
    }

    document.addEventListener("mousedown",  onTrustedEvent, { capture: true, passive: true });
    document.addEventListener("touchstart", onTrustedEvent, { capture: true, passive: true });
    document.addEventListener("touchend",   onTrustedEvent, { capture: true, passive: true });
    document.addEventListener("keydown",    onTrustedEvent, { capture: true, passive: true });

    return () => {
      document.removeEventListener("mousedown",  onTrustedEvent, true);
      document.removeEventListener("touchstart", onTrustedEvent, true);
      document.removeEventListener("touchend",   onTrustedEvent, true);
      document.removeEventListener("keydown",    onTrustedEvent, true);
    };
  }, [mounted]);

  // ── Bouton : pause / reprise uniquement ────────────────────────────────
  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!_player) return;

    if (!_activated) {
      // Premier vrai clic → activer le son
      _activate();
      if (_activated) { setActive(true); setPaused(false); }
      return;
    }

    if (paused) {
      _player.playVideo();
      _player.unMute();
      _player.setVolume(30);
      setPaused(false);
      setActive(true);
      localStorage.setItem("gg_music", "on");
    } else {
      _player.pauseVideo();
      setPaused(true);
      setActive(false);
      localStorage.setItem("gg_music", "off");
    }
  }

  if (!mounted) return null;

  return (
    <>
      {/* Iframe YouTube invisible mais rendue */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0,
          width: "1px", height: "1px",
          overflow: "hidden", opacity: 0,
          pointerEvents: "none", zIndex: -1,
        }}
        aria-hidden="true"
      >
        <div id="gg-yt-player" style={{ width: "1px", height: "1px" }} />
      </div>

      {/* Bouton flottant */}
      <button
        onClick={toggle}
        title={paused ? "Reprendre la musique" : active ? "Couper la musique" : "Activer la musique"}
        className={`fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          active
            ? "bg-amber-500 text-gray-900 hover:bg-amber-400"
            : paused
            ? "bg-gray-900 text-white/50 hover:text-white hover:bg-gray-700"
            : "bg-amber-500/60 text-gray-900"
        }`}
      >
        {paused ? (
          <VolumeX size={17} />
        ) : active ? (
          <span className="flex items-end gap-[3px] h-4">
            {[0.5, 1, 0.4, 0.8].map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-gray-900"
                style={{
                  height: `${h * 100}%`,
                  animation: `eq ${0.5 + i * 0.12}s ease-in-out ${i * 0.12}s infinite alternate`,
                }}
              />
            ))}
          </span>
        ) : (
          <>
            <Music size={17} />
            <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-60" />
          </>
        )}
      </button>

      <style>{`
        @keyframes eq {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}
