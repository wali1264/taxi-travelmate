
import React from 'react';
import { Driver, Location } from '../../utils/types';
import { Card } from '@/components/ui/card';
import { Car } from 'lucide-react'; // Using Car instead of Taxi

interface MapViewProps {
  userLocation: Location | null;
  drivers: Driver[];
  selectedDriver: Driver | null;
  isLoading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  userLocation, 
  drivers, 
  selectedDriver,
  isLoading = false 
}) => {
  if (isLoading || !userLocation) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-100">
      {/* Simplified map placeholder */}
      <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
        <p className="text-gray-400">Map View</p>
      </div>

      {/* User location marker */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      {/* Driver markers */}
      {drivers.map(driver => (
        <div 
          key={driver.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            selectedDriver && selectedDriver.id === driver.id ? 'scale-125 z-10' : ''
          }`}
          style={{
            top: `${45 + Math.random() * 10}%`,
            left: `${45 + Math.random() * 10}%`,
          }}
        >
          <div className="bg-white rounded-full p-2 shadow-md">
            <Car className="h-5 w-5 text-primary" />
          </div>
        </div>
      ))}

      {/* Map controls */}
      <Card className="absolute top-4 right-4 p-2 flex space-x-2">
        <button className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm">
          <span className="text-lg">+</span>
        </button>
        <button className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm">
          <span className="text-lg">-</span>
        </button>
      </Card>
    </div>
  );
};

export default MapView;
