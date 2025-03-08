
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { RideState, Ride, Driver, Location, Address } from '../utils/types';
import { rideAPI, mapAPI } from '../utils/api';
import { useAuth } from './AuthContext';

// Initial ride state
const initialState: RideState = {
  currentRide: null,
  rideHistory: [],
  selectedDriver: null,
  isLoading: false,
  error: null
};

// Action types
type RideAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_HISTORY_SUCCESS'; rides: Ride[] }
  | { type: 'SET_CURRENT_RIDE'; ride: Ride | null }
  | { type: 'SELECT_DRIVER'; driver: Driver | null }
  | { type: 'UPDATE_RIDE_STATUS'; ride: Ride }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

// Ride reducer
const rideReducer = (state: RideState, action: RideAction): RideState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_HISTORY_SUCCESS':
      return {
        ...state,
        rideHistory: action.rides,
        isLoading: false
      };
    case 'SET_CURRENT_RIDE':
      return {
        ...state,
        currentRide: action.ride,
        isLoading: false
      };
    case 'SELECT_DRIVER':
      return {
        ...state,
        selectedDriver: action.driver
      };
    case 'UPDATE_RIDE_STATUS':
      return {
        ...state,
        currentRide: action.ride,
        isLoading: false
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create context
interface RideContextType extends RideState {
  getNearbyDrivers: (location: Location) => Promise<Driver[]>;
  getDriverDetails: (driverId: string) => Promise<Driver | null>;
  selectDriver: (driver: Driver | null) => void;
  setSelectedDriver: (driver: Driver | null) => void;
  requestRide: (driverId: string, pickup: Address, dropoff: Address) => Promise<Ride | null>;
  cancelRide: (rideId: string) => Promise<boolean>;
  getRideHistory: () => Promise<void>;
  rateRide: (rideId: string, rating: number) => Promise<boolean>;
  clearRideError: () => void;
  setCurrentRide: (ride: Ride | null) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

// Ride Provider component
export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(rideReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load ride history when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getRideHistory();
    }
  }, [isAuthenticated, user?.id]);

  // Get nearby drivers
  const getNearbyDrivers = async (location: Location) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const drivers = await mapAPI.getNearbyDrivers(location);
      return drivers;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to fetch nearby drivers' });
      return [];
    }
  };

  // Get driver details
  const getDriverDetails = async (driverId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const driver = await mapAPI.getDriverDetails(driverId);
      return driver;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to fetch driver details' });
      return null;
    }
  };

  // Select driver (alias for setSelectedDriver for backward compatibility)
  const selectDriver = (driver: Driver | null) => {
    dispatch({ type: 'SELECT_DRIVER', driver });
  };

  // Set selected driver
  const setSelectedDriver = (driver: Driver | null) => {
    dispatch({ type: 'SELECT_DRIVER', driver });
  };

  // Request ride
  const requestRide = async (driverId: string, pickup: Address, dropoff: Address) => {
    if (!user?.id) return null;
    
    dispatch({ type: 'FETCH_START' });
    try {
      const ride = await rideAPI.requestRide(user.id, driverId, pickup, dropoff);
      dispatch({ type: 'SET_CURRENT_RIDE', ride });
      return ride;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to request ride' });
      return null;
    }
  };

  // Set current ride
  const setCurrentRide = (ride: Ride | null) => {
    dispatch({ type: 'SET_CURRENT_RIDE', ride });
  };

  // Cancel ride
  const cancelRide = async (rideId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await rideAPI.cancelRide(rideId);
      if (result.success) {
        dispatch({ type: 'SET_CURRENT_RIDE', ride: null });
        return true;
      }
      return false;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to cancel ride' });
      return false;
    }
  };

  // Get ride history
  const getRideHistory = async () => {
    if (!user?.id) return;
    
    dispatch({ type: 'FETCH_START' });
    try {
      const rides = await rideAPI.getRideHistory(user.id);
      dispatch({ type: 'FETCH_HISTORY_SUCCESS', rides });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to fetch ride history' });
    }
  };

  // Rate ride
  const rateRide = async (rideId: string, rating: number) => {
    try {
      const result = await rideAPI.rateRide(rideId, rating);
      if (result.success) {
        // Update ride history after rating
        getRideHistory();
        return true;
      }
      return false;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to rate ride' });
      return false;
    }
  };

  // Clear error
  const clearRideError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    getNearbyDrivers,
    getDriverDetails,
    selectDriver,
    setSelectedDriver,
    requestRide,
    cancelRide,
    getRideHistory,
    rateRide,
    clearRideError,
    setCurrentRide
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

// Custom hook
export const useRide = () => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
