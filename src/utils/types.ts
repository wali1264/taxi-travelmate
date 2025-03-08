
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  address: string;
  location: Location;
}

export interface Vehicle {
  model: string;
  color: string;
  plate: string;
  type: string;
}

export interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  photo: string;
  vehicle: Vehicle;
  location: Location;
  isAvailable: boolean;
}

export interface User {
  id?: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  photo?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  userId: string;
  status: 'requested' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
  pickup: Address;
  dropoff: Address;
  fare?: number;
  distance?: number;
  duration?: number;
  date: string;
  userRating?: number;
  driverRating?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RideState {
  currentRide: Ride | null;
  rideHistory: Ride[];
  selectedDriver: Driver | null;
  isLoading: boolean;
  error: string | null;
}
