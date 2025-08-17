import mongoose from 'mongoose';

// Delete the existing model to force recreation
if (mongoose.models.Buyer) {
  delete mongoose.models.Buyer;
}

const buyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  ticketQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Buyer", buyerSchema);



