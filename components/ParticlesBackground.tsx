"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesBackground() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            options={{
                background: {
                    color: { value: "transparent" },
                },
                fpsLimit: 120,
                particles: {
                    color: { value: "#ffffff" },
                    links: { enable: false },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: { default: "out" },
                        random: true,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: { enable: true, width: 1920, height: 1080 },
                        value: 350,
                    },
                    opacity: {
                        value: { min: 0.1, max: 1 },
                        animation: {
                            enable: true,
                            speed: 1,
                            sync: false,
                        },
                    },
                    shape: { type: "circle" },
                    size: {
                        value: { min: 0.5, max: 2.5 },
                    },
                },
                detectRetina: true,
            }}
        />
    );
}