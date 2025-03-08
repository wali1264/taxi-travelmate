
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { rideAPI } from '../utils/api';
import { Ride } from '../utils/types';
import RideHistory from '../components/ride/RideHistory';
import AppLayout from '../components/layout/AppLayout';
import { useToast } from '@/hooks/use-toast';

const History = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRideHistory = async () => {
      if (!user || !user.id) return;
      
      try {
        setIsLoading(true);
        const rideHistory = await rideAPI.getRideHistory(user.id);
        setRides(rideHistory);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load ride history",
          variant: "destructive",
        });
        console.error("Error fetching ride history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideHistory();
  }, [user, toast]);

  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Your Ride History</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : rides.length > 0 ? (
          <RideHistory rides={rides} />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">You haven't taken any rides yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default History;
