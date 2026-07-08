import mongoose from 'mongoose';
import '../config/env.js';
import User from '../models/user.js';
import Category from '../models/category.js';
import Country from '../models/country.js';
import City from '../models/city.js';
import Destination from '../models/destination.js';
import Tour from '../models/tour.js';
import Coupon from '../models/coupon.js';

export const seedDatabase = async () => {
  try {
    console.log('Seed: Cleaning collections...');
    
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Country.deleteMany();
    await City.deleteMany();
    await Destination.deleteMany();
    await Tour.deleteMany();
    await Coupon.deleteMany();

    console.log('Seed: Creating default users...');

    // Create default users (password pre-saved hashing applies)
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@test.com',
      password: 'password123',
      role: 'Customer',
      isEmailVerified: true
    });

    const agent = await User.create({
      name: 'Sarah Agent',
      email: 'agent@test.com',
      password: 'password123',
      role: 'Agent',
      isEmailVerified: true
    });

    const manager = await User.create({
      name: 'David Manager',
      email: 'manager@test.com',
      password: 'password123',
      role: 'Manager',
      isEmailVerified: true
    });

    const finance = await User.create({
      name: 'Finance Manager',
      email: 'finance@test.com',
      password: 'password123',
      role: 'Finance',
      isEmailVerified: true
    });

    console.log('Seed: Creating categories & locations...');

    // Create Categories
    const adventure = await Category.create({
      name: 'Adventure Tour',
      slug: 'adventure-tour',
      description: 'Thrills and outdoor challenges across mountains, deserts, and rivers.'
    });

    const luxury = await Category.create({
      name: 'Luxury Getaways',
      slug: 'luxury-getaways',
      description: 'Premium hotels, business class flights, and personalized private guides.'
    });

    const budget = await Category.create({
      name: 'Budget Escapes',
      slug: 'budget-escapes',
      description: 'Affordable retreats, standard boarding, and self-guided city tours.'
    });

    const backpacker = await Category.create({
      name: 'Backpacker Specials',
      slug: 'backpacker-specials',
      description: 'Cheap hostels, shared transport, and local food experiences.'
    });

    const family = await Category.create({
      name: 'Family Packages',
      slug: 'family-packages',
      description: 'Kid-friendly resorts, interactive theme parks, and family vacation packages.'
    });

    // Create Country & City
    const switzerland = await Country.create({
      name: 'Switzerland',
      code: 'CH',
      description: 'Land of Alps and chocolate.'
    });

    const zurich = await City.create({
      name: 'Zurich',
      country: switzerland._id,
      description: 'Financial hub with high-end lake resorts.'
    });

    // Create Destination
    const alps = await Destination.create({
      name: 'Swiss Alps Zermatt',
      city: zurich._id,
      country: switzerland._id,
      description: 'Skiing resorts around the famous Matterhorn mountain.',
      coordinates: { latitude: 46.0207, longitude: 7.7491 },
      popularAttractions: ['Matterhorn', 'Gornergrat Railway'],
      bestTimeToVisit: 'December to April'
    });

    console.log('Seed: Skipping sample tours creation...');

    /*
    // Create Tour with multi-tier pricing, departures, itinerary and seasonal adjustments
    const swissTour = await Tour.create({
      title: 'Grand Swiss Alps Alpine Adventure',
      slug: 'grand-swiss-alps-alpine-adventure',
      description: 'Experience the absolute peaks of Europe. Hike Zermatt, ride glacier trains, and sleep in glass igloos.',
      durationDays: 5,
      category: adventure._id,
      destinations: [alps._id],
      country: 'Switzerland',
      city: 'Zurich',
      destination: 'Swiss Alps',
      state: 'Zurich',
      latitude: 46.0207,
      longitude: 7.7491,
      currency: 'CHF',
      timezone: 'Europe/Zurich',
      images: [],
      highlights: ['Matterhorn hiking', 'Glacier Express Ride', 'Cheese Fondue Dinner'],
      inclusions: ['4-star Hotels', 'Daily Breakfast', 'Local tour guide fees'],
      exclusions: ['International Flights', 'Travel Insurance', 'Alcoholic beverages'],
      pricingPlans: [
        { name: 'Standard', price: 1200, description: 'Double sharing rooms, standard transport tickets' },
        { name: 'Deluxe', price: 1800, description: 'Single room upgrades, panoramic trains included' },
        { name: 'Luxury', price: 3000, description: '5-star chalet lodges, private helicopter transfer' }
      ],
      seasonalPricing: [
        { name: 'Peak Winter Skiing', startDate: new Date('2026-12-15'), endDate: new Date('2027-02-28'), priceMultiplier: 1.25 }
      ],
      departures: [
        { date: new Date('2026-08-10'), totalSeats: 20, availableSeats: 20, heldSeats: 0 },
        { date: new Date('2026-12-24'), totalSeats: 15, availableSeats: 15, heldSeats: 0 }
      ],
      startLocation: { name: 'Zurich Airport', latitude: 47.4582, longitude: 8.5555 },
      endLocation: { name: 'Zermatt Station', latitude: 46.0244, longitude: 7.7486 },
      createdBy: agent._id,
      status: 'Published'
    });
    */

    console.log('Seed: Creating default coupons...');
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'Percentage',
      discountValue: 10,
      minSpend: 500,
      expireDate: new Date('2028-12-31')
    });

    console.log('Database seeded successfully!');
    console.log('=== SEEDED CREDENTIALS ===');
    console.log('Customer: customer@test.com / password123');
    console.log('Travel Agent: agent@test.com / password123');
    console.log('Agency Manager: manager@test.com / password123');
    console.log('Finance Officer: finance@test.com / password123');
    console.log('==========================');
  } catch (error) {
    console.error('Database seeding failed:', error.message);
  }
};

// Check if run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
