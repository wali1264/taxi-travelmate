
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import { rideAPI, mapAPI } from '../utils/api';
import { Driver, Ride } from '../utils/types';
import RideTracker from '../components/ride/RideTracker';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

const RideDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRide, setCurrentRide } = useRide();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRideDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // If we don't have the current ride or it doesn't match the ID, fetch it
        let ride: Ride | null = currentRide && currentRide.id === id ? currentRide : null;
        
        if (!ride) {
          ride = await rideAPI.getRideStatus(id);
          if (ride) {
            setCurrentRide(ride);
          } else {
            throw new Error("Ride not found");
          }
        }
        
        // Fetch driver details
        if (ride) {
          const driverDetails = await mapAPI.getDriverDetails(ride.driverId);
          setDriver(driverDetails);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load ride details",
          variant: "destructive",
        });
        console.error("Error fetching ride details:", error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideDetails();
  }, [id, currentRide, setCurrentRide, navigate, toast]);

  const handleCancelRide = async () => {
    if (!currentRide) return;
    
    try {
      await rideAPI.cancelRide(currentRide.id);
      toast({
        title: "Ride Cancelled",
        description: "Your ride has been cancelled successfully",
      });
      setCurrentRide(null);
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the ride",
        variant: "destructive",
      });
      console.error("Error cancelling ride:", error);
    }
  };

  const handleRateRide = async () => {
    if (!currentRide) return;
    
    try {
      await rideAPI.rateRide(currentRide.id, rating);
      toast({
        title: "Thank You",
        description: "Your rating has been submitted",
      });
      setShowRatingDialog(false);
      setCurrentRide(null);
      navigate('/history');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
      console.error("Error rating ride:", error);
    }
  };

  // Show rating dialog when ride is completed
  useEffect(() => {
    if (currentRide && currentRide.status === 'completed' && !currentRide.userRating) {
      setShowRatingDialog(true);
    }
  }, [currentRide]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!currentRide || !driver) {
    return (
      <AppLayout>
        <div className="p-4 text-center">
          <p className="text-lg">Ride not found</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <RideTracker ride={currentRide} driver={driver} />
        
        {/* Actions based on ride status */}
        {currentRide.status !== 'completed' && currentRide.status !== 'cancelled' && (
          <div className="p-4 mt-auto">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleCancelRide}
            >
              Cancel Ride
            </Button>
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Ride</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Skip
            </Button>
            <Button onClick={handleRateRide}>
              <Check className="mr-2 h-4 w-4" />
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default RideDetails;
