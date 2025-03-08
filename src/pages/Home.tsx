
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
import { ChevronUp, ChevronDown } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { currentRide, selectedDriver, setSelectedDriver } = useRide();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
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
          title: "خطا",
          description: "خطا در بارگذاری اطلاعات نقشه",
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
    setIsPanelCollapsed(false); // باز کردن پنل برای نمایش جزئیات راننده
  };

  const handleChat = () => {
    toast({
      title: "چت",
      description: "قابلیت چت به زودی در دسترس خواهد بود",
    });
  };

  const handleCall = () => {
    toast({
      title: "تماس",
      description: `در حال تماس با ${selectedDriver?.name}...`,
    });
    // در حالت واقعی اینجا اتصال به API تماس انجام می‌شود
  };

  const handleBook = () => {
    if (!selectedDriver) {
      toast({
        title: "خطا",
        description: "لطفا ابتدا یک راننده انتخاب کنید",
      });
      return;
    }
    
    toast({
      title: "درخواست سفر",
      description: "لطفا مقصد خود را مشخص کنید",
    });
  };

  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
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
            onSelectDriver={handleDriverSelect}
            isLoading={isLoading}
          />
        </div>
        
        {/* Driver Details or Request Form */}
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg transition-all duration-300 z-10 bottom-sheet ${isPanelCollapsed ? 'bottom-sheet-collapsed' : ''}`}>
          {/* Toggle Button */}
          <div className="flex justify-center">
            <button 
              className="w-10 h-6 bg-gray-100 rounded-b-lg flex items-center justify-center -mt-6 shadow-md"
              onClick={togglePanel}
            >
              {isPanelCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
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
              <h2 className="text-xl font-semibold">رانندگان در اطراف شما</h2>
              <p className="text-sm text-muted-foreground">
                رانندگان در شعاع ۵ کیلومتری شما نمایش داده می‌شوند. برای مشاهده اطلاعات بیشتر روی نشانگر راننده‌ها کلیک کنید.
              </p>
              <div className="driver-list space-y-3">
                {drivers.map(driver => (
                  <div 
                    key={driver.id} 
                    onClick={() => handleDriverSelect(driver)}
                    className="cursor-pointer tap-effect"
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
