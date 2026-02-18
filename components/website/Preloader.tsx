"use client";

import React, { useEffect } from "react";
import "./Preloader.css"; // Import for side-effect styles

const Preloader = () => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const settings = {
            progressSize: 200,
            progressColor: '#ffffff',
            lineWidth: 2,
            lineCap: 'round' as CanvasLineCap,
            preloaderAnimationDuration: 800,
            startDegree: -90,
            finalDegree: 270
        };

        const canvas = canvasRef.current;
        if (!canvas) return;
        const barCtx = canvas.getContext('2d');
        if (!barCtx) return;

        const circleCenterX = canvas.width / 2;
        const circleCenterY = canvas.height / 2;
        const circleRadius = circleCenterX - settings.lineWidth;
        const degreesPerPercent = 3.6;
        const angleMultiplier = (Math.abs(settings.startDegree) + Math.abs(settings.finalDegree)) / 360;
        const startAngle = (settings.startDegree * Math.PI) / 180;

        let currentShowedProgress = 0;
        let animationFrameId: number;

        const drawProgress = (prog: number) => {
            barCtx.clearRect(0, 0, canvas.width, canvas.height);
            barCtx.strokeStyle = settings.progressColor;
            barCtx.lineWidth = settings.lineWidth;
            barCtx.lineCap = settings.lineCap;
            barCtx.beginPath();

            const endAngle = ((prog * degreesPerPercent * angleMultiplier) * Math.PI / 180) + startAngle;
            barCtx.arc(circleCenterX, circleCenterY, circleRadius, startAngle, endAngle);
            barCtx.stroke();
        };

        const animate = () => {
            if (currentShowedProgress < progress) {
                currentShowedProgress += 2; // Smoothly increment
                if (currentShowedProgress > progress) currentShowedProgress = progress;
                drawProgress(currentShowedProgress);
            } else {
                drawProgress(progress);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [progress]);

    useEffect(() => {
        const imagesArray = Array.from(document.images);
        const imagesAmount = imagesArray.length;
        let imagesLoaded = 0;

        const onImageLoad = () => {
            imagesLoaded++;
            const currentProgress = imagesAmount > 0 ? (imagesLoaded / imagesAmount) * 100 : 100;
            setProgress(currentProgress);

            if (imagesLoaded >= imagesAmount) {
                setTimeout(() => {
                    setIsLoaded(true);
                    document.body.style.overflowY = '';
                }, 1000); // legacy duration + buffer
            }
        };

        document.body.style.overflowY = 'hidden';

        // SAFETY: Force load after 1.5s max to avoid hanging on slow network or broken images
        const safetyFinality = setTimeout(() => {
            if (!isLoaded) {
                setIsLoaded(true);
                document.body.style.overflowY = '';
                console.warn("Preloader: Forced hide after timeout");
            }
        }, 1500);

        if (imagesAmount === 0) {
            setProgress(100);
            setTimeout(() => {
                setIsLoaded(true);
                document.body.style.overflowY = '';
            }, 500);
        } else {
            imagesArray.forEach(img => {
                if (!img) return; // Null check
                if (img.complete) {
                    onImageLoad();
                } else {
                    img.addEventListener('load', onImageLoad);
                    img.addEventListener('error', onImageLoad);
                }
            });
        }

        return () => {
            clearTimeout(safetyFinality);
            imagesArray.forEach(img => {
                if (img) {
                    img.removeEventListener('load', onImageLoad);
                    img.removeEventListener('error', onImageLoad);
                }
            });
        };
    }, []);

    return (
        <div className={`preloader ${isLoaded ? 'page-loaded' : ''}`} id="preloader">
            <svg viewBox="0 0 1920 1080" preserveAspectRatio="none" version="1.1">
                <path
                    d="M0,0 C305.333333,0 625.333333,0 960,0 C1294.66667,0 1614.66667,0 1920,0 L1920,1080 C1614.66667,1080 1294.66667,1080 960,1080 C625.333333,1080 305.333333,1080 0,1080 L0,0 Z">
                </path>
            </svg>
            <div className="inner">
                <canvas ref={canvasRef} className="progress-bar" id="progress-bar" width="200" height="200"></canvas>
                <figure><img src="/assets/images/Load.PNG" alt="Image" /></figure>
                <small>Loading</small>
            </div>
        </div>
    );
};

export default Preloader;
