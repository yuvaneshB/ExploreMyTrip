import React from 'react';

// Common base SVG props mapping helper
const getSvgProps = (size = 24, strokeWidth = 2, color = 'currentColor', className = '') => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: size,
  height: size,
  fill: 'none',
  stroke: color,
  strokeWidth: strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: `transition-all duration-300 ${className}`,
});

// 1. Luxury Tours: Minimal Luxury Hotel with a Star
export const LuxuryTourIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Luxury Tour">
    {/* Hotel structure */}
    <path d="M3 21h18" />
    <path d="M5 21V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13" />
    {/* Windows */}
    <path d="M9 10h1" />
    <path d="M9 14h1" />
    <path d="M14 10h1" />
    <path d="M14 14h1" />
    {/* Entrance Door */}
    <path d="M11 21v-4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v4" />
    {/* Luxury star on top */}
    <path d="M12 2.5l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3z" />
  </svg>
);

// 2. Adventure Tours: Mountain + Hiking Trail/Flag
export const AdventureTourIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Adventure Tour">
    {/* Mountains */}
    <path d="M3 20l7-10 4 6 7-8 2 3" />
    <path d="M12 20l3-4 3 4" />
    {/* Flag on top peak */}
    <path d="M17 8V3l3 1.5-3 1.5" />
    {/* Ground/Trail */}
    <path d="M2 20h20" />
    <path d="M8 17.5a2.5 2.5 0 0 0-4 1.5" />
  </svg>
);

// 3. Budget Escapes: Wallet + Flight/Coin
export const BudgetEscapeIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Budget Escape">
    {/* Wallet base */}
    <path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />
    {/* Wallet clasp */}
    <path d="M18 10h4v4h-4a2 2 0 0 1 0-4z" />
    <path d="M20 12h0" />
    {/* Airplane silhouette rising from wallet */}
    <path d="M7 15l2.5-3.5L13 14l3.5-5" />
    <circle cx="16" cy="9" r="0.5" fill="currentColor" />
  </svg>
);

// 4. Landmarks: Eiffel Tower/Monument
export const LandmarkIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Landmark">
    {/* Ground base */}
    <path d="M4 21h16" />
    {/* Eiffel Tower Structure */}
    <path d="M12 3c-.5 0-1 .4-1.2.9L8 16h8l-2.8-12.1c-.2-.5-.7-.9-1.2-.9z" />
    <path d="M7 21l3-7m4 0l3 7" />
    <path d="M9 16h6" />
    <path d="M10.5 11.5h3" />
    <path d="M12 3v8" />
    <path d="M9 21a3 3 0 0 1 6 0" />
  </svg>
);

// 5. Temples: Pagoda/Temple Architecture
export const TempleIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Temple">
    {/* Base Platform */}
    <path d="M3 21h18" />
    {/* Bottom Level Roof */}
    <path d="M2 18c3.5-1.5 6-1.5 10-1.5s6.5 0 10 1.5" />
    <path d="M6 18v-3h12v3" />
    {/* Middle Level Roof */}
    <path d="M4 13c3-1.5 5-1.5 8-1.5s5 0 8 1.5" />
    <path d="M8 13v-3h8v3" />
    {/* Top Level Roof */}
    <path d="M6 8c2.5-1 4-1 6-1s3.5 0 6 1" />
    {/* Top Spire */}
    <path d="M12 7V3" />
  </svg>
);

// 6. Family Packages: Family elements inside location pin
export const FamilyPackageIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Family Package">
    {/* Outer Location Pin */}
    <path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 1 1 16 0z" />
    {/* Parents and Child head circle/shoulders */}
    <circle cx="9.5" cy="8.5" r="1.5" />
    <path d="M7.5 13v-1.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V13" />
    <circle cx="14.5" cy="8.5" r="1.5" />
    <path d="M12.5 13v-1.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V13" />
    <circle cx="12" cy="12.5" r="1" />
  </svg>
);

// 7. Beach Holidays: Palm Tree + Sun
export const BeachHolidayIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Beach Holiday">
    {/* Palm Trunk */}
    <path d="M12 21c-1.5-3.5-.5-7.5-.5-11.5" />
    {/* Palm Leaves */}
    <path d="M11.5 9.5c.5-3.5 3-5 5-4.5M11.5 9.5c-1.5-3.5-4-3.5-5.5-2.5M11.5 9.5c3 1.5 4.5 4 4.5 6M11.5 9.5c-3 1.5-5 3.5-5.5 6" />
    {/* Ocean Waves */}
    <path d="M3 21c2.5-1 5.5 0 9 0s6.5-1 9 0" />
    {/* Sun */}
    <circle cx="18" cy="7" r="2.5" />
  </svg>
);

// 8. Wildlife Safari: Binoculars
export const WildlifeSafariIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Wildlife Safari">
    {/* Left Barrel */}
    <rect x="5" y="7" width="5" height="11" rx="2" />
    {/* Right Barrel */}
    <rect x="14" y="7" width="5" height="11" rx="2" />
    {/* Connector Bridge */}
    <path d="M10 10h4M10 15h4" />
    {/* Eyepieces */}
    <path d="M6.5 7V5M17.5 7V5" />
    <path d="M5.5 5h2M16.5 5h2" />
    {/* Focus Dial */}
    <rect x="11" y="11" width="2" height="3" rx="0.5" />
  </svg>
);

// 9. Honeymoon Packages: Heart + Location Pin
export const HoneymoonPackageIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Honeymoon Package">
    {/* Location Pin */}
    <path d="M12 21.5s-8-5.5-8-11.5a8 8 0 1 1 16 0c0 6-8 11.5-8 11.5z" />
    {/* Heart Center */}
    <path d="M12 14s-2.5-1.8-2.5-3.5a1.8 1.8 0 0 1 3-1.4 1.8 1.8 0 0 1 3 1.4c0 1.7-2.5 3.5-2.5 3.5z" />
  </svg>
);

// 10. Cultural Tours: Museum / Historic Pillars
export const CulturalTourIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Cultural Tour">
    {/* Base structure */}
    <path d="M3 21h18" />
    {/* Pillars */}
    <path d="M5 21v-9M9 21v-9M15 21v-9M19 21v-9" />
    {/* Architrave */}
    <path d="M4 12h16" />
    {/* Pediment (Triangle Roof) */}
    <path d="M3 12l9-6 9 6" />
    {/* Circular Dome detailing */}
    <path d="M12 6c0-1.5-1-2.5-1-2.5s2 0 2 2.5" />
  </svg>
);

// 11. Food Experiences: Plate, Fork and Spoon
export const FoodExperienceIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Food Experience">
    {/* Fork outline */}
    <path d="M6 3v7a2 2 0 0 0 2 2h0v8" />
    <path d="M8 3v5M10 3v5" />
    {/* Spoon outline */}
    <path d="M17 3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h0v9" />
    <path d="M14.5 6.5h3" />
    {/* Plate outline */}
    <circle cx="12" cy="12" r="9.5" strokeDasharray="3 3" />
  </svg>
);

// 12. Nature Escapes: Mountain + Tree
export const NatureEscapeIcon = ({ size, strokeWidth, color, className }) => (
  <svg {...getSvgProps(size, strokeWidth, color, className)} aria-label="Nature Escape">
    {/* Mountain outline */}
    <path d="M2 20l7-10 6 8.5M11 16l3-4 6 8" />
    {/* Pine Tree */}
    <path d="M16 20h2M17 20v-3" />
    <path d="M14.5 17h5l-2.5-3.5-2.5 3.5z" />
    <path d="M15.5 13.5h3L17 11l-1.5 2.5z" />
    {/* Ground base line */}
    <path d="M2 20h20" />
  </svg>
);
