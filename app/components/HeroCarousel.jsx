"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2400&q=95",
    alt: "Ultra sharp premium website dashboard on a laptop",
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=95",
    alt: "Premium analytics and digital growth dashboard",
  },
  {
    src: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=2400&q=95",
    alt: "Premium web design mockup on a screen",
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
    }, 2400);

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
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 52vw, 720px"
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
          <strong>Premium web presence</strong>
          <span>Designed for trust, speed, and action.</span>
        </div>
      </div>
    </div>
  );
}
