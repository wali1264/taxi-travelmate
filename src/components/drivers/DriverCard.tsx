
import React from 'react';
import { Driver } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star, Phone, MessageCircle, X } from 'lucide-react';

interface DriverCardProps {
  driver: Driver;
  onClose: () => void;
  onChat: () => void;
  onCall: () => void;
  onBook: () => void;
}

const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  onClose,
  onChat,
  onCall,
  onBook,
}) => {
  return (
    <Card className="w-full border-0 shadow-none bg-transparent animate-slide-up">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm tap-effect"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      <div className="bg-background rounded-t-2xl shadow-md pb-5">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-20 h-20 rounded-lg object-cover shadow-sm"
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-medium rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                <Star className="h-3 w-3 fill-white" />
                {driver.rating.toFixed(1)}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium">{driver.name}</h3>
              
              <div className="mt-1 flex items-center text-muted-foreground text-sm">
                <span className="flex-shrink-0">
                  {driver.vehicle.color} {driver.vehicle.model}
                </span>
                <span className="mx-2">•</span>
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                  {driver.vehicle.plate}
                </span>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 h-9 tap-effect"
                  onClick={onChat}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 h-9 tap-effect"
                  onClick={onCall}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-5 pt-5 border-t">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-muted-foreground">Vehicle Type</h4>
                  <p className="font-medium">{driver.vehicle.type}</p>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground">ETA</h4>
                  <p className="font-medium">~5 min</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="text-xs text-muted-foreground">Est. Base Fare</h4>
                  <p className="font-medium">$10-15</p>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground">Distance</h4>
                  <p className="font-medium">0.8 miles away</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-5">
          <Button 
            className="w-full h-12 gap-2 tap-effect"
            onClick={onBook}
          >
            Request Ride
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default DriverCard;
