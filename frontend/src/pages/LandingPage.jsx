import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

// Premium Home Subcomponents
import HeroSection from '../components/home/HeroSection.jsx';
import TopTrendingDestinations from '../components/home/TopTrendingDestinations.jsx';

import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import SpecialOffers from '../components/home/SpecialOffers.jsx';
import CustomerReviews from '../components/home/CustomerReviews.jsx';
import PopularDestinationsGrid from '../components/home/PopularDestinationsGrid.jsx';
import HomeNewsletter from '../components/home/HomeNewsletter.jsx';

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, destsRes] = await Promise.all([
          api.get('/tours/categories'),
          api.get('/tours/destinations')
        ]);
        if (catsRes.data.success) setCategories(catsRes.data.categories);
        if (destsRes.data.success) setDestinations(destsRes.data.destinations);
      } catch (err) {
        console.error('Failed to load home page content:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-white relative font-sans overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero with embedded premium geocoding SearchBar */}
      <HeroSection categories={categories} />

      {/* Top Trending Destinations Showcase */}
      <TopTrendingDestinations />

      {/* Visual Popular Destinations Grid */}
      <PopularDestinationsGrid />


      {/* Why Select ExploreMyTrip Trust Section */}
      <WhyChooseUs />

      {/* Gradient Promotion Banners */}
      <SpecialOffers />

      {/* Customer Testimonial Grid */}
      <CustomerReviews />

      {/* Newsletter Signup Banner */}
      <HomeNewsletter />
    </div>
  );
};

export default LandingPage;
