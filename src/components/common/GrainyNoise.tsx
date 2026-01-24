import React from 'react';

export const GrainyNoise = () => (
    <svg className="fixed pointer-events-none opacity-0 h-0 w-0">
        <filter id="grainy-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
        </filter>
    </svg>
);
