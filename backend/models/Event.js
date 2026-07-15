const mongoose = require('mongoose');

const ticketTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "General", "VIP", "Early Bird"
    price: { type: Number, required: true, min: 0 },
    quantityTotal: { type: Number, required: true, min: 0 },
    quantitySold: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coverImageUrl: { type: String, default: '' },
    category: { type: String, default: 'General' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    ticketTiers: [ticketTierSchema],
    status: { type: String, enum: ['draft', 'live', 'sold_out', 'closed', 'cancelled'], default: 'draft' },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', category: 1 });

eventSchema.virtual('totalCapacity').get(function () {
  return this.ticketTiers.reduce((sum, t) => sum + t.quantityTotal, 0);
});

eventSchema.virtual('totalSold').get(function () {
  return this.ticketTiers.reduce((sum, t) => sum + t.quantitySold, 0);
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
