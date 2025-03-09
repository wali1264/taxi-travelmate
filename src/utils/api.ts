
import { User, Driver, Ride, Location } from './types';
import { mockDrivers, mockRideHistory, mockUserLocation } from './mockData';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      
      // First try to use browser geolocation
      if (navigator.geolocation) {
        try {
          // Try to get current position, but with a timeout
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              (error) => {
                console.error("Geolocation error:", error.message);
                reject(error);
              },
              { timeout: 3000, maximumAge: 0, enableHighAccuracy: true }
            );
          });
          
          console.log("Browser geolocation successful:", position.coords);
          return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (geoError) {
          console.log("Browser geolocation failed, using fallback:", geoError);
        }
      } else {
        console.log("Geolocation not supported by this browser");
      }
      
      // Fallback to mock data if geolocation fails or isn't available
      console.log("Using mock location data:", mockUserLocation);
      return mockUserLocation;
    } catch (error) {
      console.error("Error getting location:", error);
      // In case of any error, return the mock location as fallback
      return mockUserLocation;
    }
  },

  // Get driver's live location (simulated)
  getDriverLiveLocation: async (driverId: string): Promise<Location> => {
    await delay(300);
    
    // در دنیای واقعی، این داده‌ها از سرور یا سیستم GPS راننده دریافت می‌شود
    // برای شبیه‌سازی، مکان راننده را با یک حرکت تصادفی به سمت کاربر تغییر می‌دهیم
    
    // پیدا کردن راننده
    const driver = mockDrivers.find(d => d.id === driverId);
    if (!driver) return mockUserLocation; 
    
    // ایجاد حرکت به سمت کاربر با افزودن مقدار کوچک تصادفی
    const moveTowardsUser = (driverCoord: number, userCoord: number): number => {
      const direction = userCoord > driverCoord ? 1 : -1;
      const distance = Math.abs(userCoord - driverCoord);
      
      // اگر راننده نزدیک کاربر است، حرکت کمتری انجام دهد
      const moveAmount = Math.min(distance, Math.random() * 0.0008);
      
      return driverCoord + (moveAmount * direction);
    };
    
    // حرکت به سمت کاربر با کمی تصادفی‌سازی
    return {
      latitude: moveTowardsUser(driver.location.latitude, mockUserLocation.latitude),
      longitude: moveTowardsUser(driver.location.longitude, mockUserLocation.longitude)
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
