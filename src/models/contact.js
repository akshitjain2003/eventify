import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['user', 'venue'],
    default: 'user',
  },
  feedback: {
    type: String,
    required: true,
    minLength: 10,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
  adminResponse: {
    type: String,
    default: '',
  },
  readByUser: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Contact || mongoose.model("Contact", contactSchema);


