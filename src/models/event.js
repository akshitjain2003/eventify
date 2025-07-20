import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  eventDescription: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  eventDate: {
    type: String,
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
  performerName: {
    type: String,
    required: true,
  },
  numberOfPasses: {
    type: Number,
    required: true,
    min: 1,
    max: 10000,
  },
  passPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  eventVenue: {
    type: String,
    required: true,
  },
  performerImageUrl: {
    type: String, // store image URL or base64 or file path depending on your upload strategy
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue', // assuming a Venue model exists
    required: true,
  },
}, {
  timestamps: true,
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
