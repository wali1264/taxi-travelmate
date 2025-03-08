
import React, { useState } from 'react';
import { Ride, Driver } from '@/utils/types';
import { useRide } from '@/context/RideContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, MapPin, Star, Calendar, ArrowRight } from 'lucide-react';

interface RideHistoryItemProps {
  ride: Ride;
  onRate: (rideId: string, rating: number) => void;
}

const RideHistoryItem: React.FC<RideHistoryItemProps> = ({ ride, onRate }) => {
  const [isRating, setIsRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleRateRide = () => {
    setIsRating(true);
  };
  
  const handleSubmitRating = () => {
    if (selectedRating) {
      onRate(ride.id, selectedRating);
      setIsRating(false);
    } else {
      toast.error('Please select a rating');
    }
  };
  
  return (
    <Card className="mb-4 overflow-hidden border border-border animate-fade-in">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(ride.date)}</span>
              <span className="mx-1">•</span>
              <Clock className="h-3 w-3" />
              <span>{formatTime(ride.date)}</span>
            </div>
            
            <div className="flex items-center">
              <h3 className="font-medium">
                {ride.fare ? `$${ride.fare.toFixed(2)}` : 'Price unavailable'}
              </h3>
              {ride.userRating && (
                <div className="flex items-center gap-0.5 ml-2 bg-muted px-1.5 py-0.5 rounded-full">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-medium">{ride.userRating}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm">
              {ride.distance ? `${ride.distance.toFixed(1)} mi` : ''}
              {ride.distance && ride.duration ? ' • ' : ''}
              {ride.duration ? `${ride.duration} min` : ''}
            </div>
          </div>
        </div>
        
        <div className="mt-4 relative">
          <div className="absolute left-0 inset-y-0 flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <div className="w-0.5 flex-1 bg-muted-foreground/20"></div>
            <div className="h-3 w-3 rounded-full bg-primary"></div>
          </div>
          
          <div className="pl-6 space-y-4">
            <div className="text-sm truncate">
              <p className="text-xs text-muted-foreground">From</p>
              <p>{ride.pickup.address}</p>
            </div>
            <div className="text-sm truncate">
              <p className="text-xs text-muted-foreground">To</p>
              <p>{ride.dropoff.address}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t border-border mt-4">
        {isRating ? (
          <div className="w-full">
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button 
                  key={rating}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    selectedRating === rating 
                      ? 'bg-primary text-white' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => setSelectedRating(rating)}
                >
                  <Star className={`h-5 w-5 ${
                    selectedRating === rating ? 'fill-white' : ''
                  }`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsRating(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmitRating}
              >
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between items-center">
            <div className="text-sm">
              {ride.status === 'completed' && !ride.userRating && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="tap-effect"
                  onClick={handleRateRide}
                >
                  Rate this ride
                </Button>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

interface RideHistoryListProps {
  rides: Ride[];
}

const RideHistoryList: React.FC<RideHistoryListProps> = ({ rides }) => {
  const { rateRide } = useRide();
  
  const handleRateRide = async (rideId: string, rating: number) => {
    try {
      const success = await rateRide(rideId, rating);
      if (success) {
        toast.success('Thank you for your rating!');
      } else {
        toast.error('Failed to submit rating');
      }
    } catch (err) {
      toast.error('An error occurred while submitting your rating');
    }
  };
  
  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">No ride history yet</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Your completed rides will appear here
        </p>
        <Button asChild>
          <a href="/">Request a ride</a>
        </Button>
      </div>
    );
  }
  
  // Sort rides by date (most recent first)
  const sortedRides = [...rides].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="space-y-4">
      {sortedRides.map((ride) => (
        <RideHistoryItem 
          key={ride.id} 
          ride={ride} 
          onRate={handleRateRide}
        />
      ))}
    </div>
  );
};

export default RideHistoryList;
