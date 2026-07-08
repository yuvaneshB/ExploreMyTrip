import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    unique: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'City is required']
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: [true, 'Country is required']
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  popularAttractions: [{
    type: String
  }],
  bestTimeToVisit: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
