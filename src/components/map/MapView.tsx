
import React, { useState, useEffect, useRef } from 'react';
import { Driver, Location } from '@/utils/types';
import { useRide } from '@/context/RideContext';
import { Taxi, Navigation, MapPin, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mapAPI } from '@/utils/api';

interface MapViewProps {
  onDriverSelect?: (driver: Driver) => void;
}

const MapView: React.FC<MapViewProps> = ({ onDriverSelect }) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getNearbyDrivers } = useRide();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Mock map renderer - In a real app this would be Google Maps or Mapbox
  useEffect(() => {
    // Simulate loading user location
    const loadUserLocation = async () => {
      try {
        // In a real app, would use browser geolocation or a map provider
        const location = await mapAPI.getUserLocation();
        setUserLocation(location);
        setIsLoading(false);
        
        // Now load nearby drivers
        const drivers = await getNearbyDrivers(location);
        setNearbyDrivers(drivers);
      } catch (err) {
        setError('Could not load location data');
        setIsLoading(false);
      }
    };
    
    loadUserLocation();
  }, [getNearbyDrivers]);

  // Simulate rendering the map - this would be replaced with actual map SDK code
  useEffect(() => {
    if (userLocation && mapContainerRef.current) {
      // For demo purposes: simulate a map with CSS
      const renderMockMap = () => {
        // Clear previous markers
        markersRef.current.forEach(marker => {
          if (marker && marker.parentNode) {
            marker.parentNode.removeChild(marker);
          }
        });
        markersRef.current = [];
      
        // Add user marker
        const userMarker = document.createElement('div');
        userMarker.className = 'absolute transform -translate-x-1/2 -translate-y-1/2';
        userMarker.style.left = '50%';
        userMarker.style.top = '50%';
        userMarker.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="1"/>
              </svg>
            </div>
            <div class="text-xs font-medium mt-1 bg-white px-2 py-1 rounded-full shadow-sm">You</div>
          </div>
        `;
        mapContainerRef.current.appendChild(userMarker);
        markersRef.current.push(userMarker);
        
        // Add taxi markers at random positions around the user
        nearbyDrivers.forEach((driver, index) => {
          const offset = {
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300
          };
          
          const driverMarker = document.createElement('div');
          driverMarker.className = 'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer taxi-marker';
          driverMarker.style.left = `calc(50% + ${offset.x}px)`;
          driverMarker.style.top = `calc(50% + ${offset.y}px)`;
          driverMarker.innerHTML = `
            <div class="flex flex-col items-center">
              <div class="bg-accent text-accent-foreground rounded-full w-10 h-10 flex items-center justify-center z-10 shadow-md transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 18h8"/>
                  <path d="M8 6v12"/>
                  <circle cx="16" cy="18" r="2"/>
                  <circle cx="16" cy="6" r="2"/>
                  <path d="M16 6v2"/>
                  <path d="M16 14v2"/>
                </svg>
              </div>
            </div>
          `;
          
          driverMarker.addEventListener('click', () => {
            // Handle taxi selection
            if (onDriverSelect) {
              onDriverSelect(driver);
            }
            
            // Highlight selected taxi
            document.querySelectorAll('.taxi-marker').forEach(marker => {
              marker.querySelector('div > div')?.classList.remove('bg-primary');
              marker.querySelector('div > div')?.classList.add('bg-accent');
            });
            
            driverMarker.querySelector('div > div')?.classList.remove('bg-accent');
            driverMarker.querySelector('div > div')?.classList.add('bg-primary');
          });
          
          mapContainerRef.current.appendChild(driverMarker);
          markersRef.current.push(driverMarker);
        });
      };
      
      renderMockMap();
      mapRef.current = { center: userLocation };
    }
  }, [userLocation, nearbyDrivers, onDriverSelect]);

  // Center map on user location
  const centerOnUser = () => {
    if (!userLocation) return;
    
    // In a real app, would call map.setCenter() or similar
    toast.info("Centering map on your location");
    
    // Simulate re-centering by re-rendering markers
    if (mapContainerRef.current) {
      markersRef.current.forEach(marker => {
        if (marker && marker.parentNode) {
          marker.parentNode.removeChild(marker);
        }
      });
      markersRef.current = [];
      
      // Re-render map (simplified for demo)
      const event = new Event('resize');
      window.dispatchEvent(event);
    }
  };

  // Handle retry on error
  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate getting user location
      const location = await mapAPI.getUserLocation();
      setUserLocation(location);
      
      // Load nearby drivers
      const drivers = await getNearbyDrivers(location);
      setNearbyDrivers(drivers);
      setIsLoading(false);
    } catch (err) {
      setError('Could not load location data');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] bg-secondary/20">
        <Loader className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] bg-secondary/20">
        <MapPin className="h-10 w-10 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Failed to load map</p>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={handleRetry} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-15rem)] w-full bg-secondary/20 overflow-hidden rounded-lg">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full bg-[#f5f5f7] relative">
        {/* Map grid lines for visual effect */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <React.Fragment key={`h${i}`}>
              <div className="w-full h-px bg-gray-200 absolute left-0" style={{ top: `${(i + 1) * (100 / 6)}%` }} />
              <div className="h-full w-px bg-gray-200 absolute top-0" style={{ left: `${(i + 1) * (100 / 6)}%` }} />
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Center button */}
      <Button
        onClick={centerOnUser}
        className="absolute bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-md tap-effect"
        variant="secondary"
      >
        <Navigation className="h-5 w-5" />
        <span className="sr-only">Center on me</span>
      </Button>
      
      {/* Taxis count indicator */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm shadow rounded-full px-3 py-1 text-sm flex items-center gap-2">
        <Taxi className="h-4 w-4 text-primary" />
        <span>{nearbyDrivers.length} drivers nearby</span>
      </div>
    </div>
  );
};

export default MapView;
