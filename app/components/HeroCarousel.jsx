"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=82",
    alt: "Premium analytics dashboard on a laptop",
  },
  {
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82",
    alt: "Modern digital agency workspace",
  },
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=82",
    alt: "Website performance dashboard screen",
  },
  {
    src: "/images/zac-living-preview.png",
    alt: "Zac.Living live website preview",
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hero-media-shell">
      <div className="hero-image-frame">
        {slides.map((slide, index) => (
          <Image
            key={slide.alt}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`hero-slide-image ${index === active ? "is-active" : ""}`}
          />
        ))}
        <div className="hero-dots" aria-label="Hero image carousel">
          {slides.map((slide, index) => (
            <button
              key={slide.alt}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              className={index === active ? "is-active" : ""}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      </div>
      <div className="hero-media-card">
        <span className="hero-media-icon">↗</span>
        <div>
          <strong>Conversion-first build</strong>
          <span>Hero, proof, WhatsApp, maps, forms, and mobile journey planned before design.</span>
        </div>
      </div>
    </div>
  );
}
