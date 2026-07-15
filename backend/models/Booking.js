const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketTierId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tierName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },

    paymentProvider: { type: String, enum: ['stripe', 'razorpay', 'free'], default: 'free' },
    paymentIntentId: { type: String }, // stripe payment_intent id / razorpay order id
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },

    // Unique per-booking secret used to sign/verify the QR code. Never exposed to client.
    qrSecret: { type: String, default: () => crypto.randomBytes(16).toString('hex') },
    qrCodeDataUrl: { type: String }, // base64 PNG rendered on successful payment

    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

bookingSchema.index({ event: 1, attendee: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
