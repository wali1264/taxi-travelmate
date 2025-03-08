
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ride, Driver } from '@/utils/types';
import { useRide } from '@/context/RideContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, Navigation, MapPin, Phone, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RideTrackerProps {
  ride: Ride;
  driver: Driver;
}

const RideTracker: React.FC<RideTrackerProps> = ({ ride, driver }) => {
  const [rideStatus, setRideStatus] = useState(ride.status);
  const [estimatedTime, setEstimatedTime] = useState(5); // minutes
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  const { cancelRide } = useRide();
  const navigate = useNavigate();

  // Simulate ride status updates
  useEffect(() => {
    const statusSequence = ['requested', 'accepted', 'arriving', 'in_progress', 'completed'];
    const currentIndex = statusSequence.indexOf(rideStatus);
    
    if (currentIndex < statusSequence.length - 1) {
      const timers = [5000, 10000, 15000, 12000]; // time in each state
      
      const timer = setTimeout(() => {
        const nextStatus = statusSequence[currentIndex + 1] as Ride['status'];
        setRideStatus(nextStatus);
        
        if (nextStatus === 'accepted') {
          toast.success('Driver has accepted your ride request!');
        } else if (nextStatus === 'arriving') {
          toast.info('Your driver is arriving soon');
        } else if (nextStatus === 'in_progress') {
          toast.info('Your ride has started');
        } else if (nextStatus === 'completed') {
          toast.success('You have arrived at your destination!');
          setTimeout(() => {
            navigate('/history');
          }, 3000);
        }
      }, timers[currentIndex]);
      
      return () => clearTimeout(timer);
    }
  }, [rideStatus, navigate]);

  // Countdown timer
  useEffect(() => {
    if (rideStatus === 'accepted' || rideStatus === 'arriving') {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        if (estimatedTime > 0 && elapsedTime % 60 === 0) {
          setEstimatedTime(prev => Math.max(prev - 1, 0));
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [rideStatus, estimatedTime, elapsedTime]);

  // Handle call driver
  const handleCallDriver = () => {
    // In a real app, would initiate a phone call
    toast.info(`Calling ${driver.name}...`);
  };

  // Handle message driver
  const handleMessageDriver = () => {
    // In a real app, would open a chat interface
    toast.info(`Messaging ${driver.name}...`);
  };

  // Handle cancel ride
  const handleCancelRide = async () => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      try {
        const success = await cancelRide(ride.id);
        if (success) {
          toast.success('Ride cancelled successfully');
          navigate('/');
        } else {
          toast.error('Failed to cancel ride');
        }
      } catch (err) {
        toast.error('An error occurred while cancelling the ride');
      }
    }
  };

  return (
    <div className="p-5 bg-background rounded-t-2xl shadow-md animate-slide-up">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {rideStatus === 'requested' && 'Requesting Ride...'}
            {rideStatus === 'accepted' && 'Driver is on the way'}
            {rideStatus === 'arriving' && 'Driver is arriving'}
            {rideStatus === 'in_progress' && 'On the way to destination'}
            {rideStatus === 'completed' && 'Ride completed'}
          </h2>
          
          {rideStatus !== 'completed' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 tap-effect"
              onClick={handleCancelRide}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {(rideStatus === 'accepted' || rideStatus === 'arriving') && (
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {estimatedTime} min{estimatedTime !== 1 ? 's' : ''} away
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-6 flex items-start gap-4">
        <img
          src={driver.photo}
          alt={driver.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        
        <div className="flex-1">
          <h3 className="font-medium">{driver.name}</h3>
          <p className="text-sm text-muted-foreground">
            {driver.vehicle.color} {driver.vehicle.model} • {driver.vehicle.plate}
          </p>
          
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1 h-9 tap-effect"
              onClick={handleCallDriver}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1 h-9 tap-effect"
              onClick={handleMessageDriver}
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute left-4 inset-y-0 flex flex-col items-center">
            <div className="h-4 w-4 rounded-full bg-primary mt-2"></div>
            <div className="w-0.5 flex-1 bg-muted-foreground/20"></div>
            <div className="h-4 w-4 rounded-full bg-primary mb-2"></div>
          </div>
          
          <div className="pl-12 space-y-8 py-2">
            <div>
              <p className="text-sm text-muted-foreground">Pickup</p>
              <p className="font-medium">{ride.pickup.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dropoff</p>
              <p className="font-medium">{ride.dropoff.address}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative bg-gray-50 rounded-lg overflow-hidden h-2">
        <div 
          className={cn(
            "absolute left-0 top-0 h-full bg-primary transition-all duration-1000",
            rideStatus === 'requested' && "w-[10%]",
            rideStatus === 'accepted' && "w-[30%]",
            rideStatus === 'arriving' && "w-[50%]",
            rideStatus === 'in_progress' && "w-[80%]",
            rideStatus === 'completed' && "w-full"
          )}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Requested</span>
        <span>Pickup</span>
        <span>Destination</span>
      </div>
      
      {rideStatus === 'completed' && (
        <div className="mt-6">
          <Button 
            className="w-full tap-effect"
            onClick={() => navigate('/history')}
          >
            View Ride History
          </Button>
        </div>
      )}
    </div>
  );
};

export default RideTracker;
