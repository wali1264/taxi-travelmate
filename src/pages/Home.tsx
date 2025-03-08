
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRide } from '../context/RideContext';
import { mapAPI } from '../utils/api';
import { Driver, Location } from '../utils/types';
import MapView from '../components/map/MapView';
import DriverCard from '../components/drivers/DriverCard';
import RideRequest from '../components/ride/RideRequest';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const { user } = useAuth();
  const { currentRide, selectedDriver, setSelectedDriver } = useRide();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to ride details if there is an active ride
    if (currentRide) {
      navigate(`/ride/${currentRide.id}`);
      return;
    }

    // Fetch user location and nearby drivers
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const location = await mapAPI.getUserLocation();
        setUserLocation(location);
        
        const nearbyDrivers = await mapAPI.getNearbyDrivers(location);
        setDrivers(nearbyDrivers);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load map data",
          variant: "destructive",
        });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentRide, navigate, toast]);

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleChat = () => {
    toast({
      title: "Chat",
      description: "Chat feature will be available soon",
    });
  };

  const handleCall = () => {
    toast({
      title: "Call",
      description: "Call feature will be available soon",
    });
  };

  const handleBook = () => {
    toast({
      title: "Book",
      description: "Please select a destination first",
    });
  };

  return (
    <AppLayout>
      <div className="relative h-full flex flex-col">
        {/* Map View */}
        <div className="flex-1">
          <MapView 
            userLocation={userLocation} 
            drivers={drivers} 
            selectedDriver={selectedDriver}
            isLoading={isLoading}
          />
        </div>
        
        {/* Driver Details or Request Form */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg transition-all duration-300 z-10">
          {selectedDriver ? (
            <div className="p-4">
              <DriverCard 
                driver={selectedDriver} 
                expanded={true}
                onClose={() => setSelectedDriver(null)}
                onChat={handleChat}
                onCall={handleCall}
                onBook={handleBook}
              />
              <RideRequest selectedDriver={selectedDriver} />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <h2 className="text-xl font-semibold">Available Drivers</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {drivers.map(driver => (
                  <div 
                    key={driver.id} 
                    onClick={() => handleDriverSelect(driver)}
                    className="cursor-pointer"
                  >
                    <DriverCard 
                      driver={driver} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
