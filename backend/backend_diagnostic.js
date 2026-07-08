import './src/config/env.js';
import mongoose from 'mongoose';
import Category from './src/models/category.js';
import Destination from './src/models/destination.js';
import AgentTour from './src/models/agentTour.js';
import City from './src/models/city.js';
import Country from './src/models/country.js';

const test = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected successfully!');

    console.log('\n--- Testing Category.find() ---');
    try {
      const categories = await Category.find();
      console.log('Categories success, count:', categories.length);
    } catch (err) {
      console.error('Categories failed:', err);
    }

    console.log('\n--- Testing Destination.find().populate(...) ---');
    try {
      const destinations = await Destination.find().populate('city').populate('country');
      console.log('Destinations success, count:', destinations.length);
    } catch (err) {
      console.error('Destinations failed:', err);
    }

    console.log('\n--- Testing AgentTour.find() for Trending ---');
    try {
      const publishedTours = await AgentTour.find({ status: 'Published' }).populate('category');
      console.log('AgentTours success, count:', publishedTours.length);
    } catch (err) {
      console.error('AgentTours failed:', err);
    }

    await mongoose.disconnect();
    console.log('\nTesting completed. Disconnected.');
  } catch (err) {
    console.error('Connection failed:', err);
  }
};

test();
