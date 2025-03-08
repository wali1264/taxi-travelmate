
import React, { useEffect, useState, useRef } from 'react';
import { Driver, Ride, Location } from '@/utils/types';
import { mapAPI } from '@/utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, MapPin, Clock, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RideTrackerProps {
  ride: Ride;
  driver: Driver;
}

const RideTracker: React.FC<RideTrackerProps> = ({ ride, driver }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(5); // دقیقه
  
  // تبدیل وضعیت سفر به فارسی برای نمایش
  const getRideStatusText = () => {
    switch(ride.status) {
      case 'requested': return 'درخواست شده';
      case 'accepted': return 'پذیرفته شده';
      case 'arriving': return 'در حال رسیدن';
      case 'in_progress': return 'در حال انجام';
      case 'completed': return 'تکمیل شده';
      case 'cancelled': return 'لغو شده';
      default: return ride.status;
    }
  };

  // ایجاد و مدیریت نقشه
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // تنظیم توکن دسترسی Mapbox - از همان توکن دمو استفاده می‌کنیم
    const DEMO_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2x0NXBmM2M1MDluNTJrcGM4amk1ZmR1MSJ9.a3rRII3S79F-vW7BtqnLOQ';
    mapboxgl.accessToken = DEMO_TOKEN;
    
    // ایجاد نقشه با مرکزیت موقعیت مبدأ
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [
        ride.pickup.location.longitude, 
        ride.pickup.location.latitude
      ],
      zoom: 14
    });

    // افزودن کنترل‌های ناوبری
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // نشانگر مبدأ
    const pickupEl = document.createElement('div');
    pickupEl.innerHTML = `
      <div class="bg-green-500 p-2 rounded-full shadow-md">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `;
    
    pickupMarker.current = new mapboxgl.Marker(pickupEl)
      .setLngLat([ride.pickup.location.longitude, ride.pickup.location.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<p>مبدأ: ${ride.pickup.address}</p>`))
      .addTo(map.current);
    
    // نشانگر مقصد
    const dropoffEl = document.createElement('div');
    dropoffEl.innerHTML = `
      <div class="bg-red-500 p-2 rounded-full shadow-md">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `;
    
    dropoffMarker.current = new mapboxgl.Marker(dropoffEl)
      .setLngLat([ride.dropoff.location.longitude, ride.dropoff.location.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<p>مقصد: ${ride.dropoff.address}</p>`))
      .addTo(map.current);
    
    // شروع به‌روزرسانی موقعیت راننده
    updateDriverLocation();
    
    // تنظیم فاصله‌نمایی برای نمایش همه نشانگرها
    map.current.on('load', () => {
      fitMapToBounds();
    });
    
    // پاکسازی در هنگام unmount
    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
      
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);
  
  // به‌روزرسانی موقعیت راننده
  const updateDriverLocation = async () => {
    try {
      // دریافت موقعیت جدید راننده
      const location = await mapAPI.getDriverLiveLocation(driver.id);
      setDriverLocation(location);
      
      // اگر نشانگر راننده وجود ندارد، آن را ایجاد کنید
      if (!driverMarker.current && map.current) {
        const driverEl = document.createElement('div');
        driverEl.className = 'driver-marker selected-driver';
        driverEl.innerHTML = `
          <div class="bg-white rounded-full p-2 shadow-md ring-2 ring-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
        `;
        
        driverMarker.current = new mapboxgl.Marker(driverEl)
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current);
          
        // پنجره اطلاعات راننده
        driverMarker.current.setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <p class="font-bold">${driver.name}</p>
                <p>${driver.vehicle.model} - ${driver.vehicle.color}</p>
                <p>${driver.vehicle.plate}</p>
              </div>
            `)
        );
      } else if (driverMarker.current) {
        // به‌روزرسانی موقعیت نشانگر
        driverMarker.current.setLngLat([location.longitude, location.latitude]);
      }
      
      // به‌روزرسانی زمان تخمینی رسیدن بر اساس وضعیت سفر
      updateEstimatedTime(location);
      
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
    
    // تنظیم زمان‌بندی برای به‌روزرسانی بعدی
    if (!locationUpdateInterval.current) {
      locationUpdateInterval.current = setInterval(updateDriverLocation, 3000);
    }
  };
  
  // تنظیم محدوده نقشه برای نمایش همه نشانگرها
  const fitMapToBounds = () => {
    if (!map.current || !ride) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    
    // افزودن مبدأ و مقصد به محدوده
    bounds.extend([ride.pickup.location.longitude, ride.pickup.location.latitude]);
    bounds.extend([ride.dropoff.location.longitude, ride.dropoff.location.latitude]);
    
    // افزودن موقعیت راننده اگر وجود دارد
    if (driverLocation) {
      bounds.extend([driverLocation.longitude, driverLocation.latitude]);
    }
    
    // تنظیم محدوده نقشه با فاصله
    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 100, right: 100 }
    });
  };
  
  // به‌روزرسانی زمان تخمینی بر اساس وضعیت سفر و فاصله
  const updateEstimatedTime = (driverLoc: Location) => {
    if (!driverLoc || !ride) return;
    
    // شبیه‌سازی محاسبه زمان باقیمانده بر اساس وضعیت سفر
    if (ride.status === 'accepted' || ride.status === 'arriving') {
      // محاسبه فاصله تقریبی بین راننده و مبدأ
      const distance = getDistance(
        driverLoc.latitude,
        driverLoc.longitude,
        ride.pickup.location.latitude,
        ride.pickup.location.longitude
      );
      
      // تبدیل فاصله به زمان تخمینی (فرض می‌کنیم هر کیلومتر حدود 2 دقیقه طول می‌کشد)
      const minutes = Math.max(1, Math.round(distance * 2));
      setEstimatedTime(minutes);
    } else if (ride.status === 'in_progress') {
      // محاسبه فاصله تقریبی بین راننده و مقصد
      const distance = getDistance(
        driverLoc.latitude,
        driverLoc.longitude,
        ride.dropoff.location.latitude,
        ride.dropoff.location.longitude
      );
      
      // تبدیل فاصله به زمان تخمینی (فرض می‌کنیم هر کیلومتر حدود 2 دقیقه طول می‌کشد)
      const minutes = Math.max(1, Math.round(distance * 2));
      setEstimatedTime(minutes);
    }
  };
  
  // محاسبه فاصله بین دو نقطه به کیلومتر (فرمول هاورساین)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // شعاع زمین به کیلومتر
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // فاصله به کیلومتر
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };
  
  // نمایش پیام وضعیت بر اساس وضعیت سفر
  const getRideStatusMessage = () => {
    switch(ride.status) {
      case 'requested':
        return 'راننده در حال بررسی درخواست شما است...';
      case 'accepted':
        return `راننده درخواست شما را پذیرفته و در حال حرکت به سمت مبدأ است (حدود ${estimatedTime} دقیقه)`;
      case 'arriving':
        return `راننده تا ${estimatedTime} دقیقه دیگر به مبدأ می‌رسد`;
      case 'in_progress':
        return `در مسیر مقصد - زمان تخمینی رسیدن: ${estimatedTime} دقیقه`;
      case 'completed':
        return 'سفر شما با موفقیت به پایان رسید';
      case 'cancelled':
        return 'این سفر لغو شده است';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* نقشه */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      
      {/* اطلاعات سفر */}
      <Card className="ride-details-panel m-4 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">جزئیات سفر</h2>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {getRideStatusText()}
            </span>
          </div>
          
          {/* پیام وضعیت */}
          <div className="bg-muted p-3 rounded-md mb-4 text-sm">
            {getRideStatusMessage()}
          </div>
          
          {/* اطلاعات راننده */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={driver.photo}
              alt={driver.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h3 className="font-medium">{driver.name}</h3>
              <p className="text-sm text-muted-foreground">
                {driver.vehicle.color} {driver.vehicle.model} • {driver.vehicle.plate}
              </p>
            </div>
            
            {/* دکمه‌های تماس و چت - فقط برای سفرهای فعال */}
            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
              <div className="ml-auto flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full h-10 w-10">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button size="icon" className="rounded-full h-10 w-10">
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
          
          {/* مبدأ و مقصد */}
          <div className="space-y-3 my-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مبدأ</p>
                <p className="font-medium">{ride.pickup.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مقصد</p>
                <p className="font-medium">{ride.dropoff.address}</p>
              </div>
            </div>
          </div>
          
          {/* اطلاعات تکمیلی */}
          <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(ride.date).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            {ride.distance && (
              <div className="flex items-center gap-1">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span>{ride.distance} کیلومتر</span>
              </div>
            )}
            
            {ride.fare && (
              <div className="font-medium">
                {ride.fare.toLocaleString()} تومان
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideTracker;
