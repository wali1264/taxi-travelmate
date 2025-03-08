
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Driver, Address } from '@/utils/types';
import { useRide } from '@/context/RideContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MapPin, Pointer, Search, Car } from 'lucide-react';

interface RideRequestProps {
  selectedDriver: Driver | null;
}

const RideRequest: React.FC<RideRequestProps> = ({ selectedDriver }) => {
  const [pickup, setPickup] = useState<Address>({
    address: '123 Market St, San Francisco, CA',
    location: { latitude: 37.7855, longitude: -122.4010 }
  });
  const [dropoff, setDropoff] = useState<Address>({
    address: '',
    location: { latitude: 0, longitude: 0 }
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const { requestRide } = useRide();
  const navigate = useNavigate();

  const handleRequestRide = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver first');
      return;
    }

    if (!dropoff.address) {
      toast.error('Please enter a destination');
      return;
    }

    setIsRequesting(true);

    try {
      // For demo, set a random location for dropoff
      const randomDropoff = {
        ...dropoff,
        location: {
          latitude: pickup.location.latitude + (Math.random() - 0.5) * 0.1,
          longitude: pickup.location.longitude + (Math.random() - 0.5) * 0.1
        }
      };

      const ride = await requestRide(selectedDriver.id, pickup, randomDropoff);
      
      if (ride) {
        toast.success('Ride requested successfully!');
        // Normally we'd navigate to a ride tracking page here
        // For demo, we'll simulate driver accepting after a delay
        setTimeout(() => {
          navigate(`/ride/${ride.id}`);
        }, 2000);
      } else {
        toast.error('Failed to request ride. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred while requesting the ride');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="p-5 bg-background rounded-t-2xl shadow-md animate-slide-up">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Where to?</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Current location</p>
              <p className="text-xs text-muted-foreground truncate">{pickup.address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Pointer className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 relative">
              <Input
                value={dropoff.address}
                onChange={(e) => setDropoff({ ...dropoff, address: e.target.value })}
                placeholder="Enter destination"
                className="pl-0 border-0 border-b border-border focus-visible:ring-0 rounded-none py-2 shadow-none"
              />
              {!dropoff.address && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Saved places</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-2 px-3 justify-start gap-2 tap-effect"
            onClick={() => setDropoff({
              address: 'Home: 456 Valencia St',
              location: { latitude: 37.7649, longitude: -122.4214 }
            })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-sm">Home</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-2 px-3 justify-start gap-2 tap-effect"
            onClick={() => setDropoff({
              address: 'Work: 123 Mission St',
              location: { latitude: 37.7850, longitude: -122.4050 }
            })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="16" height="16" x="4" y="4" rx="2" />
              <rect width="4" height="4" x="10" y="10" />
              <path d="M4 16h16" />
            </svg>
            <span className="text-sm">Work</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          {selectedDriver && (
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{selectedDriver.name}'s {selectedDriver.vehicle.model}</span>
            </div>
          )}
        </div>
        <Button 
          className="tap-effect"
          disabled={!selectedDriver || !dropoff.address || isRequesting}
          onClick={handleRequestRide}
        >
          {isRequesting ? 'Requesting...' : 'Request Ride'}
        </Button>
      </div>
    </div>
  );
};

export default RideRequest;
