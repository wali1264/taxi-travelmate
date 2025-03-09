import { User, Driver, Ride, Location } from './types';
import { mockDrivers, mockRideHistory, mockUserLocation } from './mockData';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Set default location to Farah, Afghanistan
const FARAH_LOCATION: Location = {
  latitude: 32.3747, 
  longitude: 62.1167
};

// Authentication API
export const authAPI = {
  // Send verification code to phone
  sendVerificationCode: async (phoneNumber: string): Promise<{ success: boolean, message: string }> => {
    await delay(1500);
    // Simulate success
    return { success: true, message: "Verification code sent successfully" };
  },

  // Verify phone with code
  verifyCode: async (phoneNumber: string, code: string): Promise<{ success: boolean, user: User | null, token?: string, message?: string }> => {
    await delay(2000);
    
    // For demo, any 6-digit code works
    if (code.length === 6) {
      return {
        success: true,
        user: { id: 'u1', phoneNumber },
        token: 'mock-jwt-token'
      };
    }
    
    return { 
      success: false, 
      user: null, 
      message: "Invalid verification code"
    };
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<{ success: boolean, user: User | null }> => {
    await delay(1000);
    return {
      success: true,
      user: { 
        id: 'u1', 
        phoneNumber: userData.phoneNumber || '+1234567890',
        name: userData.name,
        email: userData.email,
        photo: userData.photo
      }
    };
  }
};

// Map and Drivers API
export const mapAPI = {
  // Get nearby drivers
  getNearbyDrivers: async (location: Location): Promise<Driver[]> => {
    await delay(1000);
    return mockDrivers;
  },

  // Get driver details
  getDriverDetails: async (driverId: string): Promise<Driver | null> => {
    await delay(800);
    return mockDrivers.find(driver => driver.id === driverId) || null;
  },

  // Get user's current location
  getUserLocation: async (): Promise<Location> => {
    console.log("Getting user location...");
    try {
      await delay(500);
      
      // For demo purposes, return Farah location directly
      console.log("Using Farah, Afghanistan as default location");
      return FARAH_LOCATION;
    } catch (error) {
      console.error("Error getting location:", error);
      // In case of any error, return Farah location as fallback
      return FARAH_LOCATION;
    }
  },

  // Get driver's live location (simulated)
  getDriverLiveLocation: async (driverId: string): Promise<Location> => {
    await delay(300);
    
    // In the real world, this data would come from the driver's GPS system
    // For simulation, we'll make a random movement from the driver's current position towards user
    
    // Find driver
    const driver = mockDrivers.find(d => d.id === driverId);
    if (!driver) return FARAH_LOCATION; 
    
    // Create movement towards user with small random addition
    const moveTowardsUser = (driverCoord: number, userCoord: number): number => {
      const direction = userCoord > driverCoord ? 1 : -1;
      const distance = Math.abs(userCoord - driverCoord);
      
      // If driver is close to user, make smaller movements
      const moveAmount = Math.min(distance, Math.random() * 0.0008);
      
      return driverCoord + (moveAmount * direction);
    };
    
    // Move towards user with some randomization
    return {
      latitude: moveTowardsUser(driver.location.latitude, FARAH_LOCATION.latitude),
      longitude: moveTowardsUser(driver.location.longitude, FARAH_LOCATION.longitude)
    };
  }
};

// Ride API
export const rideAPI = {
  // Request a ride
  requestRide: async (userId: string, driverId: string, pickup: any, dropoff: any): Promise<Ride> => {
    await delay(2000);
    
    const newRide: Ride = {
      id: `r${Date.now()}`,
      driverId,
      userId,
      status: 'requested',
      pickup,
      dropoff,
      date: new Date().toISOString()
    };
    
    return newRide;
  },

  // Get ride status
  getRideStatus: async (rideId: string): Promise<Ride | null> => {
    await delay(1000);
    const ride = mockRideHistory.find(ride => ride.id === rideId);
    return ride || null;
  },

  // Get ride history
  getRideHistory: async (userId: string): Promise<Ride[]> => {
    await delay(1500);
    return mockRideHistory;
  },

  // Rate a ride
  rateRide: async (rideId: string, rating: number): Promise<{ success: boolean }> => {
    await delay(1000);
    return { success: true };
  },

  // Cancel a ride
  cancelRide: async (rideId: string): Promise<{ success: boolean }> => {
    await delay(1500);
    return { success: true };
  }
};
