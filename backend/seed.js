/**
 * Seed script — populates the database with sample data for showcasing.
 *
 * Usage:
 *   node seed.js
 *
 * This will:
 *   1. Drop all existing data
 *   2. Create sample users (1 organizer, 2 attendees)
 *   3. Create sample events (music, tech, food, entertainment)
 *   4. Create bookings with QR codes
 *   5. Mark some bookings as checked in
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');
const { generateQrDataUrl } = require('./utils/qr');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventflow';

const users = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    role: 'organizer',
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'password123',
    role: 'attendee',
  },
  {
    name: 'Arun Kumar',
    email: 'arun@example.com',
    password: 'password123',
    role: 'attendee',
  },
];

const makeEvents = (organizerId) => [
  {
    title: 'Mumbai Music Festival 2026',
    description:
      'Experience the biggest music festival of the year featuring top artists from across India. Enjoy live performances spanning Bollywood, Indie Rock, EDM, and Classical Fusion across three stages. Food stalls, art installations, and a vibrant community atmosphere make this an unforgettable weekend.',
    category: 'Music',
    organizer: organizerId,
    venue: { name: 'Rang Sharda Auditorium', address: 'Plot No 238, Bandra West', city: 'Mumbai' },
    coverImageUrl: '',
    startDate: new Date('2026-08-15T17:00:00+05:30'),
    endDate: new Date('2026-08-16T23:00:00+05:30'),
    ticketTiers: [
      { name: 'General Admission', price: 25, quantityTotal: 200, quantitySold: 0 },
      { name: 'VIP Pass', price: 75, quantityTotal: 50, quantitySold: 0 },
      { name: 'Backstage Experience', price: 150, quantityTotal: 20, quantitySold: 0 },
    ],
    status: 'live',
  },
  {
    title: 'Tech Innovation Summit 2026',
    description:
      'India\'s premier technology conference bringing together developers, founders, and industry leaders. Featuring keynotes on AI/ML, Cloud Architecture, Cybersecurity, and Web3. Network with 1000+ tech professionals and attend hands-on workshops led by engineers from top product companies.',
    category: 'Technology',
    organizer: organizerId,
    venue: { name: 'India International Convention Centre', address: 'Sector 25, Dwarka', city: 'New Delhi' },
    coverImageUrl: '',
    startDate: new Date('2026-09-05T09:00:00+05:30'),
    endDate: new Date('2026-09-06T18:00:00+05:30'),
    ticketTiers: [
      { name: 'Standard Pass', price: 30, quantityTotal: 300, quantitySold: 0 },
      { name: 'Premium Pass', price: 80, quantityTotal: 100, quantitySold: 0 },
      { name: 'Workshop Bundle', price: 120, quantityTotal: 40, quantitySold: 0 },
    ],
    status: 'live',
  },
  {
    title: 'Food & Culture Carnival',
    description:
      'A gastronomic journey through India\'s diverse culinary heritage. Sample street food from 50+ vendors representing every state, watch live cooking demonstrations by celebrity chefs, and enjoy cultural performances including folk dances, puppetry, and storytelling sessions for the whole family.',
    category: 'Food',
    organizer: organizerId,
    venue: { name: 'Mysore Palace Grounds', address: 'Sayyaji Rao Road', city: 'Mysore' },
    coverImageUrl: '',
    startDate: new Date('2026-10-10T10:00:00+05:30'),
    endDate: new Date('2026-10-12T22:00:00+05:30'),
    ticketTiers: [
      { name: 'General Entry', price: 15, quantityTotal: 500, quantitySold: 0 },
      { name: 'Food Pass (All Access)', price: 45, quantityTotal: 200, quantitySold: 0 },
      { name: 'VIP Experience', price: 100, quantityTotal: 50, quantitySold: 0 },
    ],
    status: 'live',
  },
  {
    title: 'Bollywood Dance Night',
    description:
      'An electrifying evening of Bollywood music and dance! Groove to the hottest tracks performed live by a full orchestra, with professional dancers showcasing iconic choreography. Dress code: glamorous retro Bollywood. Prizes for the best dancer and best costume!',
    category: 'Entertainment',
    organizer: organizerId,
    venue: { name: 'Nehru Centre', address: 'Dr. Annie Besant Road, Worli', city: 'Mumbai' },
    coverImageUrl: '',
    startDate: new Date('2026-07-20T19:00:00+05:30'),
    endDate: new Date('2026-07-20T23:30:00+05:30'),
    ticketTiers: [
      { name: 'Regular', price: 20, quantityTotal: 150, quantitySold: 0 },
      { name: 'VIP', price: 60, quantityTotal: 40, quantitySold: 0 },
      { name: 'Couple Pass', price: 100, quantityTotal: 30, quantitySold: 0 },
    ],
    status: 'live',
  },
];

const makeBookings = (events, attendeePriyaId, attendeeArunId, organizerId) => {
  const musicEvent = events[0];
  const techEvent = events[1];
  const foodEvent = events[2];
  const danceEvent = events[3];

  return [
    // Priya books 3 General tickets for Music Festival (checked in)
    {
      event: musicEvent._id,
      attendee: attendeePriyaId,
      ticketTierId: musicEvent.ticketTiers[0]._id,
      tierName: 'General Admission',
      quantity: 3,
      unitPrice: 25,
      totalAmount: 75,
      paymentProvider: 'free',
      paymentStatus: 'paid',
      checkedIn: true,
      checkedInAt: new Date('2026-08-16T18:30:00+05:30'),
      checkedInBy: organizerId,
      status: 'active',
      createdAt: new Date('2026-08-10T14:30:00+05:30'),
    },
    // Priya books 1 Premium ticket for Tech Summit (not checked in)
    {
      event: techEvent._id,
      attendee: attendeePriyaId,
      ticketTierId: techEvent.ticketTiers[1]._id,
      tierName: 'Premium Pass',
      quantity: 1,
      unitPrice: 80,
      totalAmount: 80,
      paymentProvider: 'free',
      paymentStatus: 'paid',
      checkedIn: false,
      status: 'active',
      createdAt: new Date('2026-08-20T10:15:00+05:30'),
    },
    // Priya books 2 Food Pass for Food Carnival (not checked in - future event)
    {
      event: foodEvent._id,
      attendee: attendeePriyaId,
      ticketTierId: foodEvent.ticketTiers[1]._id,
      tierName: 'Food Pass (All Access)',
      quantity: 2,
      unitPrice: 45,
      totalAmount: 90,
      paymentProvider: 'free',
      paymentStatus: 'paid',
      checkedIn: false,
      status: 'active',
      createdAt: new Date('2026-09-01T16:45:00+05:30'),
    },
    // Arun books 2 VIP tickets for Music Festival (both checked in)
    {
      event: musicEvent._id,
      attendee: attendeeArunId,
      ticketTierId: musicEvent.ticketTiers[1]._id,
      tierName: 'VIP Pass',
      quantity: 2,
      unitPrice: 75,
      totalAmount: 150,
      paymentProvider: 'free',
      paymentStatus: 'paid',
      checkedIn: true,
      checkedInAt: new Date('2026-08-15T17:45:00+05:30'),
      checkedInBy: organizerId,
      status: 'active',
      createdAt: new Date('2026-08-01T11:00:00+05:30'),
    },
    // Arun books 1 Standard ticket for Tech Summit (not checked in)
    {
      event: techEvent._id,
      attendee: attendeeArunId,
      ticketTierId: techEvent.ticketTiers[0]._id,
      tierName: 'Standard Pass',
      quantity: 1,
      unitPrice: 30,
      totalAmount: 30,
      paymentProvider: 'free',
      paymentStatus: 'paid',
      checkedIn: false,
      status: 'active',
      createdAt: new Date('2026-08-25T09:30:00+05:30'),
    },
    // Arun books 1 VIP ticket for Bollywood Night (checked in)
    {
      event: danceEvent._id,
      attendee: attendeeArunId,
      ticketTierId: danceEvent.ticketTiers[1]._id,
      tierName: 'VIP',
      quantity: 1,
      unitPrice: 60,
      totalAmount: 60,
      paymentProvider: 'free',
      paymentStatus: 'paid',
      checkedIn: true,
      checkedInAt: new Date('2026-07-20T20:15:00+05:30'),
      checkedInBy: organizerId,
      status: 'active',
      createdAt: new Date('2026-07-15T13:00:00+05:30'),
    },
  ];
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Drop existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('Cleared.');

    // Create users (need to handle password hashing manually since we use create, not save)
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Use insertMany to bypass the pre('save') hook (password is already hashed)
    const createdUsers = await User.insertMany(
      users.map((u) => ({ ...u, password: hashedPassword }))
    );
    console.log(`  ✓ ${createdUsers.length} users created`);

    const organizer = createdUsers.find((u) => u.role === 'organizer');
    const attendeePriya = createdUsers.find((u) => u.email === 'priya@example.com');
    const attendeeArun = createdUsers.find((u) => u.email === 'arun@example.com');

    // Create events
    console.log('Creating events...');
    const eventsData = makeEvents(organizer._id);
    const createdEvents = await Event.create(eventsData);
    console.log(`  ✓ ${createdEvents.length} events created`);

    // Update quantitySold for events based on the bookings we'll create
    const musicEvent = createdEvents[0];
    const techEvent = createdEvents[1];
    const foodEvent = createdEvents[2];
    const danceEvent = createdEvents[3];

    // Pre-sell some tickets so the dashboard shows non-zero data
    musicEvent.ticketTiers[0].quantitySold = 3;  // Priya bought 3 General
    musicEvent.ticketTiers[1].quantitySold = 2;  // Arun bought 2 VIP
    techEvent.ticketTiers[0].quantitySold = 1;   // Arun bought 1 Standard
    techEvent.ticketTiers[1].quantitySold = 1;   // Priya bought 1 Premium
    foodEvent.ticketTiers[1].quantitySold = 2;   // Priya bought 2 Food Pass
    danceEvent.ticketTiers[1].quantitySold = 1;  // Arun bought 1 VIP

    await Promise.all(createdEvents.map((e) => e.save()));
    console.log('  ✓ Ticket counts updated');

    // Create bookings with QR codes
    console.log('Creating bookings with QR codes...');
    const bookingsData = makeBookings(createdEvents, attendeePriya._id, attendeeArun._id, organizer._id);

    const createdBookings = [];
    for (const bData of bookingsData) {
      const booking = await Booking.create(bData);
      // Generate QR code for each booking
      booking.qrCodeDataUrl = await generateQrDataUrl(booking._id, booking.qrSecret);
      await booking.save();
      createdBookings.push(booking);
    }
    console.log(`  ✓ ${createdBookings.length} bookings created with QR codes`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ Seeding complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Sample login credentials:');
    console.log('──────────────────────────────');
    console.log('  Organizer:  rahul@example.com / password123');
    console.log('  Attendee 1: priya@example.com / password123');
    console.log('  Attendee 2: arun@example.com / password123');
    console.log('──────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
