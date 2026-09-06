"use client";

import { useEffect, useState } from "react";
import type { Offer } from "@/lib/data/growth";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

export function OfferPopup({ offer }: { offer: Offer }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Basic frequency logic
    const storageKey = `ajs_offer_popup_${offer.id}`;
    
    const shouldShow = () => {
      if (offer.popupFrequency === "every_visit") return true;
      
      if (offer.popupFrequency === "once_per_session") {
        if (sessionStorage.getItem(storageKey)) return false;
        return true;
      }

      if (offer.popupFrequency === "once_per_day") {
        const lastSeen = localStorage.getItem(storageKey);
        if (!lastSeen) return true;
        const diff = Date.now() - parseInt(lastSeen, 10);
        return diff > 24 * 60 * 60 * 1000;
      }

      if (offer.popupFrequency === "custom" && offer.popupCustomHours) {
        const lastSeen = localStorage.getItem(storageKey);
        if (!lastSeen) return true;
        const diff = Date.now() - parseInt(lastSeen, 10);
        return diff > offer.popupCustomHours * 60 * 60 * 1000;
      }

      return true;
    };

    if (shouldShow()) {
      // Delay opening slightly so it isn't jarring on page load
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [offer]);

  const handleClose = () => {
    setOpen(false);
    
    // Record view
    const storageKey = `ajs_offer_popup_${offer.id}`;
    if (offer.popupFrequency === "once_per_session") {
      sessionStorage.setItem(storageKey, "1");
    } else if (
      offer.popupFrequency === "once_per_day" || 
      offer.popupFrequency === "custom"
    ) {
      localStorage.setItem(storageKey, Date.now().toString());
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={offer.title}
      description={offer.shortDescription ?? undefined}
      footer={
        offer.ctaUrl ? (
          <Button as="link" href={offer.ctaUrl} onClick={handleClose}>
            {offer.ctaLabel || "View offer"}
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">
        {offer.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="aspect-video w-full rounded-lg object-cover"
          />
        )}
        {offer.fullDescription && (
          <p className="text-sm text-ink-muted">{offer.fullDescription}</p>
        )}
      </div>
    </Dialog>
  );
}
