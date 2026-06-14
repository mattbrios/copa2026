"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

export function SwRegister() {
  const [showToast, setShowToast] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      // Reload the page when the new service worker takes control
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates periodically or on load
        const trackInstalling = (worker: ServiceWorker) => {
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              // New content is available; trigger prompt
              setWaitingWorker(worker);
              setShowToast(true);
            }
          });
        };

        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowToast(true);
        }

        if (registration.installing) {
          trackInstalling(registration.installing);
        }

        registration.addEventListener("updatefound", () => {
          if (registration.installing) {
            trackInstalling(registration.installing);
          }
        });
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowToast(false);
    }
  };

  if (!showToast) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-scale-in max-w-sm md:left-auto md:right-4 bg-card-bg border border-card-border p-4 rounded-2xl shadow-2xl glass-panel flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-brand-accent/20 rounded-xl text-brand-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-white">Nova versão disponível!</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Há novidades disponíveis para a sua tabela da Copa 2026.
          </p>
        </div>
      </div>
      <button
        onClick={handleUpdate}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-semibold smooth-transition active:scale-95 cursor-pointer shadow-lg shadow-brand-accent/20"
      >
        <span>Atualizar Agora</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
