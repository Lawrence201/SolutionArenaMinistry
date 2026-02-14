"use client";

import React, { useEffect } from "react";

const Hero = () => {
  useEffect(() => {
    // Manually initialize slick if it's not already initialized by the legacy script
    // This ensures that even if custom.js ran too early, the hero slider will work.
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && (window as any).$ && (window as any).$.fn.slick) {
        const $ = (window as any).$;
        const $slider = $(".hero-one-slider");
        if ($slider.length && !$slider.hasClass('slick-initialized')) {
          $slider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            dots: false,
            autoplay: true,
            autoplaySpeed: 5000,
            speed: 2000,
            cssEase: 'linear',
            fade: false // User didn't specify fade, and custom.js had fade: false for hero-one
          });
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero-one">
      <div className="hero-one-slider">
        <div>
          <div className="hero-slide-content">
            <img src="/assets/images/Month.png" alt="hero-one-slider" />
          </div>
        </div>

        <div>
          <div className="hero-slide-content">
            <img src="/assets/images/New_Year.png" alt="hero-one-slider" />
          </div>
        </div>

        <div>
          <div className="hero-slide-content">
            <img src="/assets/images/hero-img-3.jpg" alt="hero-one-slider" />
            <div className="hero-data text-center">
              <h1>Worship That<br /> is Pleasing to God</h1>
              <p>God has given us power and authority.</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-one {
          height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .hero-one-slider {
          height: 100vh;
        }
        .hero-slide-content {
          position: relative;
          width: 100%;
          height: 100vh;
        }
        .hero-one-slider img {
          width: 100%;
          height: 100vh;
          object-fit: cover;
          transform: scale(1);
        }
        .hero-one-slider .slick-active img {
          animation: ken-burns-in 8s 1 ease-in-out forwards;
        }
        .hero-slide-content::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(20, 20, 20, 0.5);
          pointer-events: none;
          z-index: 1;
        }
        
        .hero-data {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          width: 100%;
          padding: 0 15px;
          animation: fadeInUpSD 2s forwards;
        }

        @keyframes ken-burns-in {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.15); /* Zoom IN */
          }
        }

        @keyframes fadeInUpSD {
          0% {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 50px));
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        /* Fix for slick slider height */
        .hero-one-slider .slick-track, 
        .hero-one-slider .slick-list, 
        .hero-one-slider .slick-slide > div {
          height: 100%;
        }
        
        /* Ensure arrows are visible */
        .hero-one-slider button.slick-arrow {
            z-index: 10;
        }
      `}} />
    </section>
  );
};

export default Hero;
