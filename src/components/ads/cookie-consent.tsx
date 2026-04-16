"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing to not interrupt first impression
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  }

  function handleDecline() {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-2xl mx-auto bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <p className="text-sm text-neutral-300 mb-4">
              Usamos cookies para mejorar tu experiencia y mostrar anuncios
              relevantes. Puedes aceptar o rechazar las cookies no esenciales.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecline}
                className="text-neutral-400 hover:text-white"
              >
                Rechazar
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="bg-[#0079da] hover:bg-[#0069c0] text-white"
              >
                Aceptar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
