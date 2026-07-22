import React from 'react';

interface NewDanceLogoProps {
  className?: string;
  lightTheme?: boolean;
}

export default function NewDanceLogo({ className = '', lightTheme = false }: NewDanceLogoProps) {
  const strokeColor = lightTheme ? '#27272a' : '#ffffff'; // Outline stroke color
  const silhouetteMan = lightTheme ? '#27272a' : '#ffffff';
  
  return (
    <svg 
      viewBox="12 18 430 172" 
      className={`select-none pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldStarGradientND" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>

      {/* "ACADEMIA DE BAILE" - Outline tall font */}
      <text 
        x="230" 
        y="45" 
        textAnchor="middle" 
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        fontFamily="'Space Grotesk', 'Inter', sans-serif" 
        fontWeight="400" 
        fontSize="24" 
        letterSpacing="11"
      >
        ACADEMIA DE BAILE
      </text>
      
      {/* "NEW" and 5 Stars */}
      <g>
        {/* "NEW" in Bold Orange */}
        <text 
          x="48" 
          y="112" 
          fill="#F97316" 
          fontFamily="'Space Grotesk', sans-serif" 
          fontWeight="900" 
          fontSize="68" 
          letterSpacing="-1"
        >
          NEW
        </text>
        
        {/* Stars (5 Gold 3D Stars) */}
        <g transform="translate(230, 92)">
          <polygon points="0,-12 3.5,-3 12.5,-3 5.5,3 8,12 0,6 -8,12 -5.5,3 -12.5,-3 -3.5,-3" fill="url(#goldStarGradientND)" stroke="#A16207" strokeWidth="0.5" />
          <polygon points="34,-12 37.5,-3 46.5,-3 39.5,3 42,12 34,6 26,12 28.5,3 21.5,-3 30.5,-3" fill="url(#goldStarGradientND)" stroke="#A16207" strokeWidth="0.5" />
          <polygon points="68,-12 71.5,-3 80.5,-3 73.5,3 76,12 68,6 60,12 62.5,3 55.5,-3 64.5,-3" fill="url(#goldStarGradientND)" stroke="#A16207" strokeWidth="0.5" />
          <polygon points="102,-12 105.5,-3 114.5,-3 107.5,3 110,12 102,6 94,12 96.5,3 89.5,-3 98.5,-3" fill="url(#goldStarGradientND)" stroke="#A16207" strokeWidth="0.5" />
          <polygon points="136,-12 139.5,-3 148.5,-3 141.5,3 144,12 136,6 128,12 130.5,3 123.5,-3 132.5,-3" fill="url(#goldStarGradientND)" stroke="#A16207" strokeWidth="0.5" />
        </g>
      </g>
      
      {/* "DANCE" in outline font & "RD" in solid orange */}
      <g>
        {/* Custom drawn outline D */}
        <g transform="translate(45, 126)">
          {/* Outline shape of D */}
          <path 
            d="M5,10 L30,10 C50,10 60,20 60,35 C60,50 50,60 30,60 L5,60 Z" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="4.5" 
            strokeLinejoin="round" 
          />
          
          {/* Dancing couple silhouette inside D */}
          <g transform="translate(15, 18) scale(0.7)" opacity="0.95">
            {/* Salsa couple */}
            {/* Man */}
            <circle cx="16" cy="11" r="3.5" fill={silhouetteMan} />
            <path d="M16,15 C13,17 11,23 9,31 L13,31 L15,24 L17,31 L21,31 C19,25 19,19 17,17 L16,15 Z" fill={silhouetteMan} />
            <path d="M16,17 L25,13 L27,17" stroke={silhouetteMan} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Woman */}
            <circle cx="29" cy="13" r="3" fill="#F97316" />
            <path d="M29,16 C27,18 25,22 26,28 C27,29 26,31 24,33 L28,33 L30,28 C31,27 33,28 34,30 L37,33 L40,33 C37,29 36,25 32,20 C32,18 31,17 29,16 Z" fill="#F97316" />
            <path d="M29,18 L21,15 L17,17" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        </g>
        
        {/* "ANCE" Outline Letters */}
        <text 
          x="118" 
          y="180" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="4" 
          fontFamily="'Space Grotesk', sans-serif" 
          fontWeight="950" 
          fontSize="64" 
          letterSpacing="3"
        >
          ANCE
        </text>
        
        {/* "RD" in Orange bold */}
        <text 
          x="328" 
          y="180" 
          fill="#F97316" 
          fontFamily="'Space Grotesk', sans-serif" 
          fontWeight="900" 
          fontSize="64"
        >
          RD
        </text>
      </g>
    </svg>
  );
}
