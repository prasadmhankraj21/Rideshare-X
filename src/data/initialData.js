// Initial mock dataset for Rideshare_X Peer-to-Peer Cost-Sharing Platform

export const INITIAL_DRIVERS = [
  {
    id: 'drv-1',
    name: 'Rajesh Sharma',
    email: 'rajesh.driver@ridesharex.org',
    phone: '+91 98221 44321',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    verificationStatus: 'verified', // 'not_verified' | 'pending' | 'verified' | 'rejected'
    rating: 4.9,
    tripsCompleted: 42,
    joinDate: 'Jan 2025',
    vehicle: {
      make: 'Honda',
      model: 'City ZX',
      year: '2022',
      color: 'Pearl White',
      plateNumber: 'MH-12-PQ-9876',
      seatingCapacity: 5,
      fuelType: 'Petrol',
      features: ['Air Conditioning', 'Trunk Space (2 bags)', 'Phone Charger', 'Quiet Ride']
    },
    verificationDoc: {
      licenseNumber: 'DL-1420110012345',
      licenseExpiry: '2032-08-15',
      rcNumber: 'RC-MH12-9876-2022',
      idType: 'Aadhaar Card',
      idNumber: '•••• •••• 7821',
      submittedAt: '2026-01-10T10:00:00Z',
      verifiedAt: '2026-01-11T14:30:00Z'
    },
    cancellationDepositBalance: 500
  },
  {
    id: 'drv-2',
    name: 'Ananya Deshmukh',
    email: 'ananya.driver@ridesharex.org',
    phone: '+91 98450 77123',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    verificationStatus: 'verified',
    rating: 4.85,
    tripsCompleted: 28,
    joinDate: 'Mar 2025',
    vehicle: {
      make: 'Maruti Suzuki',
      model: 'Brezza ZXi+',
      year: '2023',
      color: 'Silver Grey',
      plateNumber: 'MH-14-DE-4412',
      seatingCapacity: 5,
      fuelType: 'Mild Hybrid',
      features: ['AC', 'Music System', 'Roof Carrier', 'Fastag']
    },
    verificationDoc: {
      licenseNumber: 'DL-1220150098432',
      licenseExpiry: '2034-03-20',
      rcNumber: 'RC-MH14-4412-2023',
      idType: 'Aadhaar Card',
      idNumber: '•••• •••• 4409',
      submittedAt: '2026-02-01T11:20:00Z',
      verifiedAt: '2026-02-02T09:15:00Z'
    },
    cancellationDepositBalance: 250
  },
  {
    id: 'drv-3',
    name: 'Vikram Patil',
    email: 'vikram.patil@ridesharex.org',
    phone: '+91 94220 88991',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    verificationStatus: 'pending', // Awaiting Admin Approval
    rating: 5.0,
    tripsCompleted: 0,
    joinDate: 'Oct 2026',
    vehicle: {
      make: 'Hyundai',
      model: 'Creta SX',
      year: '2022',
      color: 'Knight Black',
      plateNumber: 'MH-24-AZ-7788',
      seatingCapacity: 5,
      fuelType: 'Diesel',
      features: ['Panoramic Sunroof', 'Dual Zone AC', 'Large Boot']
    },
    verificationDoc: {
      licenseNumber: 'DL-2420190012901',
      licenseExpiry: '2038-11-05',
      rcNumber: 'RC-MH24-7788-2022',
      idType: 'Aadhaar Card',
      idNumber: '•••• •••• 1156',
      submittedAt: '2026-10-01T18:45:00Z',
      verifiedAt: null
    },
    cancellationDepositBalance: 0
  },
  {
    id: 'drv-4',
    name: 'Sameer Kulkarni',
    email: 'sameer.driver@ridesharex.org',
    phone: '+91 97654 33221',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    verificationStatus: 'not_verified',
    rating: 0,
    tripsCompleted: 0,
    joinDate: 'Oct 2026',
    vehicle: null,
    verificationDoc: null,
    cancellationDepositBalance: 0
  }
];

export const INITIAL_PASSENGERS = [
  {
    id: 'psg-1',
    name: 'Priya Mehta',
    email: 'priya.passenger@ridesharex.org',
    phone: '+91 98112 33445',
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tripsCompleted: 14,
    rating: 4.95,
    joinDate: 'Feb 2025',
    emergencyContact: {
      name: 'Kavita Mehta (Mother)',
      phone: '+91 98112 00000',
      relation: 'Parent'
    }
  },
  {
    id: 'psg-2',
    name: 'Rohan Verma',
    email: 'rohan.passenger@ridesharex.org',
    phone: '+91 99887 66554',
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    tripsCompleted: 8,
    rating: 4.8,
    joinDate: 'May 2025',
    emergencyContact: {
      name: 'Sunil Verma (Brother)',
      phone: '+91 99887 11111',
      relation: 'Sibling'
    }
  },
  {
    id: 'psg-3',
    name: 'Sneha Nair',
    email: 'sneha.passenger@ridesharex.org',
    phone: '+91 97441 55667',
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    tripsCompleted: 19,
    rating: 5.0,
    joinDate: 'Dec 2024',
    emergencyContact: {
      name: 'Anish Nair (Spouse)',
      phone: '+91 97441 99999',
      relation: 'Spouse'
    }
  }
];

export const INITIAL_ADMIN = {
  id: 'adm-1',
  name: 'System Administrator',
  email: 'prasadmhankraj21@gmail.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_RIDES = [
  {
    id: 'ride-101',
    driverId: 'drv-1',
    driverName: 'Rajesh Sharma',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.9,
    driverVerified: true,
    from: 'Latur',
    fromCoordinates: [18.4088, 76.5604],
    to: 'Pune',
    toCoordinates: [18.5204, 73.8567],
    date: '2026-10-05',
    departureTime: '07:00 AM',
    estimatedArrivalTime: '01:30 PM',
    estimatedDuration: '6h 30m',
    vehicleType: '5-Seater',
    vehicleDetails: 'Honda City ZX (Pearl White) • MH-12-PQ-9876',
    totalSeats: 5,
    availableSeats: 2, // 2 available for passengers
    totalPassengerSeatsAllowed: 2,
    sharedCostPerSeat: 300, // ₹300 per seat
    costBreakdown: {
      estimatedFuel: 180,
      highwayTolls: 120,
      note: 'Driver recovers fuel & toll cost only. No commercial profit.'
    },
    cancellationDeposit: 250, // ₹250 refundable deposit paid by driver
    depositStatus: 'escrowed', // 'escrowed' | 'refunded' | 'forfeited'
    pickupDropPoints: [
      { type: 'pickup', point: 'Shivaji Chowk, Latur', time: '07:00 AM' },
      { type: 'stop', point: 'Barshi Bypass NH-65', time: '09:15 AM' },
      { type: 'stop', point: 'Hadapsar Gadital, Pune', time: '01:00 PM' },
      { type: 'dropoff', point: 'Swargate Bus Station, Pune', time: '01:30 PM' }
    ],
    description: 'Travelling to Pune for a weekend tech meetup. Non-smoking vehicle, chilled AC, quiet ride. Up to 2 medium bags per passenger.',
    status: 'scheduled', // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    routeOptimized: false,
    routeDeviationDetected: false,
    activeLocation: {
      latitude: 18.4088,
      longitude: 76.5604,
      heading: 275,
      speedKmH: 0,
      currentMilestone: 'Starting Point: Shivaji Chowk, Latur',
      distanceCoveredKm: 0,
      totalDistanceKm: 320,
      etaMinutes: 390
    }
  },
  {
    id: 'ride-102',
    driverId: 'drv-2',
    driverName: 'Ananya Deshmukh',
    driverAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.85,
    driverVerified: true,
    from: 'Pune',
    fromCoordinates: [18.5204, 73.8567],
    to: 'Mumbai',
    toCoordinates: [19.0760, 72.8777],
    date: 'Today',
    departureTime: '09:30 AM',
    estimatedArrivalTime: '12:45 PM',
    estimatedDuration: '3h 15m',
    vehicleType: '5-Seater',
    vehicleDetails: 'Maruti Brezza ZXi+ (Silver) • MH-14-DE-4412',
    totalSeats: 5,
    availableSeats: 1, // Originally 3, 2 already booked
    totalPassengerSeatsAllowed: 3,
    sharedCostPerSeat: 280,
    costBreakdown: {
      estimatedFuel: 170,
      highwayTolls: 110,
      note: 'Cost shared for Mumbai-Pune Expressway toll (₹320) + petrol.'
    },
    cancellationDeposit: 250,
    depositStatus: 'escrowed',
    pickupDropPoints: [
      { type: 'pickup', point: 'Wakad Flyover, Pune', time: '09:30 AM' },
      { type: 'stop', point: 'Urse Toll Plaza', time: '10:05 AM' },
      { type: 'stop', point: 'Lonavala Exit', time: '10:45 AM' },
      { type: 'stop', point: 'Vashi Toll Naka', time: '12:10 PM' },
      { type: 'dropoff', point: 'Dadar T.T. Circle, Mumbai', time: '12:45 PM' }
    ],
    description: 'Weekly commute to Mumbai BKC office. AC on, safe driving, Fastag enabled. Friendly co-travellers welcome.',
    status: 'in_progress', // ACTIVE LIVE TRACKING DEMO
    routeOptimized: true,
    routeDeviationDetected: false,
    activeLocation: {
      latitude: 18.7557,
      longitude: 73.4091,
      heading: 310,
      speedKmH: 74,
      currentMilestone: 'Descending Bhor Ghat towards Khalapur Toll',
      distanceCoveredKm: 78,
      totalDistanceKm: 148,
      etaMinutes: 52
    }
  },
  {
    id: 'ride-103',
    driverId: 'drv-1',
    driverName: 'Rajesh Sharma',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.9,
    driverVerified: true,
    from: 'Mumbai',
    fromCoordinates: [19.0760, 72.8777],
    to: 'Nashik',
    toCoordinates: [19.9975, 73.7898],
    date: '2026-10-06',
    departureTime: '06:30 AM',
    estimatedArrivalTime: '10:30 AM',
    estimatedDuration: '4h 00m',
    vehicleType: '5-Seater',
    vehicleDetails: 'Honda City ZX • MH-12-PQ-9876',
    totalSeats: 5,
    availableSeats: 3,
    totalPassengerSeatsAllowed: 3,
    sharedCostPerSeat: 320,
    costBreakdown: {
      estimatedFuel: 200,
      highwayTolls: 120,
      note: 'Kasara Ghat & Samruddhi Mahamarg connector cost sharing.'
    },
    cancellationDeposit: 250,
    depositStatus: 'escrowed',
    pickupDropPoints: [
      { type: 'pickup', point: 'Thane Majiwada Flyover', time: '06:30 AM' },
      { type: 'stop', point: 'Shahapur Food Plaza', time: '07:45 AM' },
      { type: 'dropoff', point: 'Nashik CBS Stand', time: '10:30 AM' }
    ],
    description: 'Visiting family in Nashik for festival weekend. Relaxed drive, coffee halt at Shahapur.',
    status: 'scheduled',
    routeOptimized: false,
    routeDeviationDetected: false,
    activeLocation: null
  },
  {
    id: 'ride-104',
    driverId: 'drv-2',
    driverName: 'Ananya Deshmukh',
    driverAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.85,
    driverVerified: true,
    from: 'Bengaluru',
    fromCoordinates: [12.9716, 77.5946],
    to: 'Mysuru',
    toCoordinates: [12.2958, 76.6394],
    date: '2026-10-07',
    departureTime: '08:00 AM',
    estimatedArrivalTime: '10:45 AM',
    estimatedDuration: '2h 45m',
    vehicleType: '7-Seater',
    vehicleDetails: 'Toyota Innova Crysta • KA-05-MN-2201',
    totalSeats: 7,
    availableSeats: 4,
    totalPassengerSeatsAllowed: 4,
    sharedCostPerSeat: 220,
    costBreakdown: {
      estimatedFuel: 140,
      highwayTolls: 80,
      note: 'Bengaluru-Nidaghatta Expressway cost recovery.'
    },
    cancellationDeposit: 300,
    depositStatus: 'escrowed',
    pickupDropPoints: [
      { type: 'pickup', point: 'Kengeri Metro Station', time: '08:00 AM' },
      { type: 'stop', point: 'Bidadi', time: '08:35 AM' },
      { type: 'dropoff', point: 'Mysuru Suburb Bus Stand', time: '10:45 AM' }
    ],
    description: 'Day trip to Mysore palace and Chamundi Hill. Plenty of legroom in the Innova Crysta.',
    status: 'scheduled',
    routeOptimized: false,
    routeDeviationDetected: false,
    activeLocation: null
  },
  {
    id: 'ride-105',
    driverId: 'drv-1',
    driverName: 'Rajesh Sharma',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.9,
    driverVerified: true,
    from: 'Pune',
    fromCoordinates: [18.5204, 73.8567],
    to: 'Solapur',
    toCoordinates: [17.6599, 75.9064],
    date: '2026-09-28',
    departureTime: '06:00 AM',
    estimatedArrivalTime: '11:00 AM',
    estimatedDuration: '5h 00m',
    vehicleType: '5-Seater',
    vehicleDetails: 'Honda City ZX • MH-12-PQ-9876',
    totalSeats: 5,
    availableSeats: 0,
    totalPassengerSeatsAllowed: 2,
    sharedCostPerSeat: 310,
    costBreakdown: { estimatedFuel: 190, highwayTolls: 120, note: 'NH-65 toll + fuel.' },
    cancellationDeposit: 250,
    depositStatus: 'refunded', // Completed ride -> deposit returned to driver
    pickupDropPoints: [
      { type: 'pickup', point: 'Pune Station', time: '06:00 AM' },
      { type: 'dropoff', point: 'Solapur Old Bus Stand', time: '11:00 AM' }
    ],
    description: 'Business consultation visit. Trip completed smoothly.',
    status: 'completed',
    routeOptimized: true,
    routeDeviationDetected: false,
    activeLocation: null
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'bkg-201',
    rideId: 'ride-101',
    passengerId: 'psg-1',
    passengerName: 'Priya Mehta',
    passengerPhone: '+91 98112 33445',
    passengerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    seatsRequested: 1,
    from: 'Latur',
    to: 'Pune',
    pickupPoint: 'Shivaji Chowk, Latur',
    dropoffPoint: 'Hadapsar Gadital, Pune',
    totalSharedContribution: 300,
    status: 'pending', // Pending driver approval!
    requestedAt: '2026-10-02T10:15:00Z',
    notes: 'Travelling with one backpack. Will be at Shivaji Chowk 10 mins early.'
  },
  {
    id: 'bkg-202',
    rideId: 'ride-102',
    passengerId: 'psg-2',
    passengerName: 'Rohan Verma',
    passengerPhone: '+91 99887 66554',
    passengerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    seatsRequested: 2,
    from: 'Pune',
    to: 'Mumbai',
    pickupPoint: 'Wakad Flyover, Pune',
    dropoffPoint: 'Dadar T.T. Circle, Mumbai',
    totalSharedContribution: 560,
    status: 'confirmed', // Currently travelling in the active ride!
    requestedAt: '2026-10-01T14:30:00Z',
    notes: 'Travelling with my colleague. No large luggage.'
  },
  {
    id: 'bkg-203',
    rideId: 'ride-105',
    passengerId: 'psg-3',
    passengerName: 'Sneha Nair',
    passengerPhone: '+91 97441 55667',
    passengerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    seatsRequested: 2,
    from: 'Pune',
    to: 'Solapur',
    pickupPoint: 'Pune Station',
    dropoffPoint: 'Solapur Old Bus Stand',
    totalSharedContribution: 620,
    status: 'completed',
    requestedAt: '2026-09-27T08:00:00Z',
    notes: 'Pleasant and punctual driver. Very safe driving.'
  }
];

export const INITIAL_CANCELLATIONS = [
  {
    id: 'cnl-301',
    type: 'driver_cancellation',
    rideId: 'ride-past-99',
    rideRoute: 'Pune → Nashik',
    driverId: 'drv-3',
    driverName: 'Vikram Patil',
    cancellationReason: 'Vehicle problem',
    reasonCategory: 'Vehicle breakdown / puncture',
    explanationText: 'Alternator failure near Chakan bypass. Engine battery light illuminated. Had to call roadside assistance tow truck.',
    supportDocumentSample: 'Mechanic Tow Bill #4412 (Submitted for review)',
    depositAmount: 250,
    depositStatus: 'pending_review', // Admin must review if valid reason to refund deposit
    passengersAffected: 2,
    passengerRefundStatus: '100% Refund Processed to Co-travellers',
    cancelledAt: '2026-10-01T16:20:00Z',
    adminResolution: null
  },
  {
    id: 'cnl-302',
    type: 'passenger_cancellation',
    rideId: 'ride-103',
    rideRoute: 'Mumbai → Nashik',
    passengerId: 'psg-3',
    passengerName: 'Sneha Nair',
    cancellationReason: 'Emergency',
    reasonCategory: 'Medical emergency',
    explanationText: 'Family member admitted to hospital, had to cancel journey 18 hours prior to departure.',
    supportDocumentSample: null,
    depositAmount: 0,
    depositStatus: 'not_applicable',
    passengersAffected: 1,
    passengerRefundStatus: 'Full Contribution Refunded per Policy (>12h notice)',
    cancelledAt: '2026-10-01T20:10:00Z',
    adminResolution: 'Auto-resolved per standard passenger cancellation window.'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    targetUserId: 'drv-1',
    role: 'driver',
    title: 'New Booking Request Received',
    message: 'Priya Mehta requested 1 seat for Latur → Pune (5 Oct). Please review & accept.',
    time: '15 mins ago',
    type: 'booking_request',
    read: false
  },
  {
    id: 'notif-2',
    targetUserId: 'drv-2',
    role: 'driver',
    title: 'Active Ride In Progress',
    message: 'Live GPS route tracking is ON. Currently passing Lonavala Ghat.',
    time: '25 mins ago',
    type: 'ride_active',
    read: false
  },
  {
    id: 'notif-3',
    targetUserId: 'psg-2',
    role: 'passenger',
    title: 'Ride Started: Pune to Mumbai',
    message: 'Ananya Deshmukh has started the ride. Live tracking is now available.',
    time: '45 mins ago',
    type: 'ride_started',
    read: true
  },
  {
    id: 'notif-4',
    targetUserId: 'drv-1',
    role: 'driver',
    title: 'Driver Verification Approved',
    message: 'Congratulations! Your vehicle MH-12-PQ-9876 & driver license were verified by Admin.',
    time: '2 days ago',
    type: 'verification_approved',
    read: true
  }
];
