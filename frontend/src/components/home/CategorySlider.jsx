import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuxuryTourIcon, AdventureTourIcon, BudgetEscapeIcon, LandmarkIcon, 
  TempleIcon, FamilyPackageIcon, BeachHolidayIcon, WildlifeSafariIcon, 
  HoneymoonPackageIcon, CulturalTourIcon, FoodExperienceIcon, NatureEscapeIcon 
} from '../CategoryIcons.jsx';

const renderCategoryIcon = (name, size = 28, strokeWidth = 2, color = 'currentColor', className = '') => {
  const normalized = (name || '').toLowerCase();
  
  if (normalized.includes('luxury') || normalized.includes('resort') || normalized.includes('vip') || normalized.includes('getaways')) {
    return <LuxuryTourIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('adventure') || normalized.includes('hiking') || normalized.includes('climbing') || normalized.includes('rafting') || normalized.includes('camp')) {
    return <AdventureTourIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('budget') || normalized.includes('saving') || normalized.includes('backpack') || normalized.includes('affordable') || normalized.includes('specials')) {
    return <BudgetEscapeIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('landmark') || normalized.includes('globe') || normalized.includes('eiffel') || normalized.includes('monument') || normalized.includes('historical')) {
    return <LandmarkIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('temple') || normalized.includes('pagoda') || normalized.includes('spiritual') || normalized.includes('sacred') || normalized.includes('heritage') || normalized.includes('shrine')) {
    return <TempleIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('family') || normalized.includes('kid') || normalized.includes('group') || normalized.includes('packages')) {
    return <FamilyPackageIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('beach') || normalized.includes('sea') || normalized.includes('ocean') || normalized.includes('wave') || normalized.includes('sun') || normalized.includes('holidays')) {
    return <BeachHolidayIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('safari') || normalized.includes('wildlife') || normalized.includes('binoculars') || normalized.includes('animal') || normalized.includes('national park')) {
    return <WildlifeSafariIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('honeymoon') || normalized.includes('romantic') || normalized.includes('couple') || normalized.includes('heart')) {
    return <HoneymoonPackageIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('cultural') || normalized.includes('culture') || normalized.includes('museum') || normalized.includes('ancient') || normalized.includes('tours')) {
    return <CulturalTourIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('food') || normalized.includes('dining') || normalized.includes('cuisine') || normalized.includes('restaurant') || normalized.includes('plate') || normalized.includes('fork') || normalized.includes('spoon')) {
    return <FoodExperienceIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  if (normalized.includes('nature') || normalized.includes('forest') || normalized.includes('waterfall') || normalized.includes('lake') || normalized.includes('river')) {
    return <NatureEscapeIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
  }
  
  return <AdventureTourIcon size={size} strokeWidth={strokeWidth} color={color} className={className} />;
};

const CategorySlider = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center text-center space-y-3 mb-10">
        <span className="text-[10px] bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          Experience Styles
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-900 to-blue-600 font-black">Travel Categories</span>
        </h2>
        <p className="text-slate-500 text-xs max-w-md leading-relaxed">
          Find your perfect getaway styled precisely to your vacation interest and comfort plans.
        </p>
      </div>

      {/* Categories Scrollable Container */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent snap-x snap-mandatory">
        {categories.map((cat) => (
          <div 
            key={cat._id}
            onClick={() => navigate(`/tours?category=${cat._id}`)}
            className="flex-shrink-0 w-36 sm:w-44 bg-white border border-slate-100 hover:border-gold-300 hover:shadow-[0_12px_24px_rgba(212,175,55,0.08)] rounded-3xl p-5 cursor-pointer hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center gap-3.5 snap-start relative overflow-hidden"
          >
            {/* Background shape */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 rounded-full translate-x-3 -translate-y-3 group-hover:scale-[1.8] group-hover:bg-gold-500/5 transition-all duration-300 pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-gold-500/10 flex items-center justify-center text-slate-650 group-hover:text-gold-500 group-hover:bg-gold-500/10 group-hover:scale-105 transition-all duration-300 shrink-0 shadow-inner">
              {renderCategoryIcon(cat.name, 24, 2, 'currentColor', 'group-hover:rotate-3')}
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-700 group-hover:text-gold-500 transition-colors tracking-wide leading-tight">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] mt-1 group-hover:text-slate-500 transition-colors">
                {cat.description || 'Explore deals'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySlider;
