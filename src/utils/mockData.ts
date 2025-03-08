
import { User, Driver, Ride } from './types';

export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'John Davis',
    phoneNumber: '+1234567890',
    rating: 4.8,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
    vehicle: {
      model: 'Toyota Camry',
      color: 'Silver',
      plate: 'ABC123',
      type: 'Sedan'
    },
    location: {
      latitude: 37.7855,
      longitude: -122.4010
    },
    isAvailable: true
  },
  {
    id: 'd2',
    name: 'Sarah Johnson',
    phoneNumber: '+1987654321',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    vehicle: {
      model: 'Honda Civic',
      color: 'Black',
      plate: 'XYZ789',
      type: 'Sedan'
    },
    location: {
      latitude: 37.7835,
      longitude: -122.4030
    },
    isAvailable: true
  },
  {
    id: 'd3',
    name: 'Michael Rodriguez',
    phoneNumber: '+1567891234',
    rating: 4.7,
    photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=256&auto=format&fit=crop',
    vehicle: {
      model: 'Ford Explorer',
      color: 'White',
      plate: 'LMN456',
      type: 'SUV'
    },
    location: {
      latitude: 37.7875,
      longitude: -122.3990
    },
    isAvailable: true
  },
  {
    id: 'd4',
    name: 'Emily Chen',
    phoneNumber: '+1654789321',
    rating: 4.6,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
    vehicle: {
      model: 'Tesla Model 3',
      color: 'Blue',
      plate: 'EV9876',
      type: 'Electric'
    },
    location: {
      latitude: 37.7825,
      longitude: -122.4000
    },
    isAvailable: true
  }
];

export const mockRideHistory: Ride[] = [
  {
    id: 'r1',
    driverId: 'd1',
    userId: 'u1',
    status: 'completed',
    pickup: {
      address: '123 Market St, San Francisco, CA',
      location: { latitude: 37.7855, longitude: -122.4010 }
    },
    dropoff: {
      address: '456 Valencia St, San Francisco, CA',
      location: { latitude: 37.7649, longitude: -122.4214 }
    },
    fare: 18.50,
    distance: 2.3,
    duration: 15,
    date: '2023-06-15T14:30:00Z',
    userRating: 5
  },
  {
    id: 'r2',
    driverId: 'd2',
    userId: 'u1',
    status: 'completed',
    pickup: {
      address: '789 Mission St, San Francisco, CA',
      location: { latitude: 37.7850, longitude: -122.4050 }
    },
    dropoff: {
      address: '555 California St, San Francisco, CA',
      location: { latitude: 37.7925, longitude: -122.4070 }
    },
    fare: 12.75,
    distance: 1.8,
    duration: 12,
    date: '2023-06-10T09:15:00Z',
    userRating: 4
  },
  {
    id: 'r3',
    driverId: 'd3',
    userId: 'u1',
    status: 'completed',
    pickup: {
      address: '100 Powell St, San Francisco, CA',
      location: { latitude: 37.7850, longitude: -122.4080 }
    },
    dropoff: {
      address: '1 Ferry Building, San Francisco, CA',
      location: { latitude: 37.7955, longitude: -122.3937 }
    },
    fare: 21.00,
    distance: 2.5,
    duration: 18,
    date: '2023-05-28T18:45:00Z',
    userRating: 5
  },
  {
    id: 'r4',
    driverId: 'd4',
    userId: 'u1',
    status: 'completed',
    pickup: {
      address: 'Fisherman\'s Wharf, San Francisco, CA',
      location: { latitude: 37.8080, longitude: -122.4177 }
    },
    dropoff: {
      address: 'Golden Gate Park, San Francisco, CA',
      location: { latitude: 37.7694, longitude: -122.4862 }
    },
    fare: 28.50,
    distance: 4.2,
    duration: 25,
    date: '2023-05-15T11:20:00Z',
    userRating: 4
  }
];

export const mockUserLocation = {
  latitude: 37.7849,
  longitude: -122.4000
};
