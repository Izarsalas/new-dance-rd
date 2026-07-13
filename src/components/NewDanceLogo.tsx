import React from 'react';

interface NewDanceLogoProps {
  className?: string;
  lightTheme?: boolean;
}

export default function NewDanceLogo({ className = '', lightTheme = false }: NewDanceLogoProps) {
  const textColor = lightTheme ? '#3f3f46' : '#a1a1aa'; // Academia de Baile text
  const strokeColor = lightTheme ? '#27272a' : '#ffffff'; // DANCE outline
  const silhouetteMan = lightTheme ? '#27272a' : '#ffffff';
  
  return (
    <svg 
      viewBox="0 0 500 280" 
      className={`w-full h-full select-none pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* "ACADEMIA DE BAILE" */}
      <text 
        x="250" 
        y="70" 
        textAnchor="middle" 
        fill={textColor} 
        fontFamily="'Inter', 'Space Grotesk', sans-serif" 
        fontWeight="300" 
        fontSize="20" 
        letterSpacing="8"
      >
        ACADEMIA DE BAILE
      </text>
      
      {/* "NEW" and Stars */}
      <g transform="translate(10, 0)">
        {/* "NEW" in Bold Orange */}
        <text 
          x="65" 
          y="145" 
          fill="#F97316" 
          fontFamily="'Space Grotesk', sans-serif" 
          fontWeight="900" 
          fontSize="72" 
          letterSpacing="-2"
        >
          NEW
        </text>
        
        {/* Stars (5 Gold Stars) */}
        <g transform="translate(250, 115)">
          <polygon points="0,-12 3.5,-3 12.5,-3 5.5,3 8,12 0,6 -8,12 -5.5,3 -12.5,-3 -3.5,-3" fill="#EAB308" />
          <polygon points="35,-12 38.5,-3 47.5,-3 40.5,3 43,12 35,6 27,12 29.5,3 22.5,-3 31.5,-3" fill="#EAB308" />
          <polygon points="70,-12 73.5,-3 82.5,-3 75.5,3 78,12 70,6 62,12 64.5,3 57.5,-3 66.5,-3" fill="#EAB308" />
          <polygon points="105,-12 108.5,-3 117.5,-3 110.5,3 113,12 105,6 97,12 99.5,3 92.5,-3 101.5,-3" fill="#EAB308" />
          <polygon points="140,-12 143.5,-3 152.5,-3 145.5,3 148,12 140,6 132,12 134.5,3 127.5,-3 136.5,-3" fill="#EAB308" />
        </g>
      </g>
      
      {/* "DANCE" in outline font & "RD" in solid orange */}
      <g transform="translate(15, 0)">
        {/* Custom drawn outline D */}
        <g transform="translate(60, 160)">
          {/* Outline shape of D */}
          <path 
            d="M5,10 L30,10 C50,10 60,20 60,35 C60,50 50,60 30,60 L5,60 Z" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="4.5" 
            strokeLinejoin="round" 
          />
          
          {/* Dancing couple silhouette inside D */}
          <g transform="translate(15, 18) scale(0.7)" opacity="0.9">
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
          x="135" 
          y="215" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="4" 
          fontFamily="'Space Grotesk', sans-serif" 
          fontWeight="950" 
          fontSize="68" 
          letterSpacing="4"
        >
          ANCE
        </text>
        
        {/* "RD" in Orange bold */}
        <text 
          x="355" 
          y="215" 
          fill="#F97316" 
          fontFamily="'Space Grotesk', sans-serif" 
          fontWeight="900" 
          fontSize="68"
        >
          RD
        </text>
      </g>
    </svg>
  );
}
