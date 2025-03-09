
import React, { useEffect, useRef, useState } from 'react';
import { Driver, Location } from '../../utils/types';
import { Card } from '@/components/ui/card';
import { Car, Plus, Minus, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  userLocation: Location | null;
  drivers: Driver[];
  selectedDriver: Driver | null;
  onSelectDriver?: (driver: Driver) => void;
  isLoading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  userLocation, 
  drivers, 
  selectedDriver,
  onSelectDriver,
  isLoading = false 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState<number>(14);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // استفاده از یک توکن موقت برای نمایش
  const DEMO_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2x0NXBmM2M1MDluNTJrcGM4amk1ZmR1MSJ9.a3rRII3S79F-vW7BtqnLOQ';
  
  console.log("MapView rendering with userLocation:", userLocation);
  
  // تابع برای ایجاد نقشه
  const initializeMap = () => {
    if (!mapContainer.current || !userLocation) {
      console.log("Cannot initialize map: container or location missing", mapContainer.current ? "Container exists" : "No container", userLocation ? "Location exists" : "No location");
      return;
    }

    if (!mapboxgl.supported()) {
      console.log("MapboxGL is not supported in this browser");
      setMapError("نقشه در مرورگر شما پشتیبانی نمی‌شود. لطفاً از مرورگر دیگری استفاده کنید.");
      return;
    }

    console.log("Initializing map with center:", [userLocation.longitude, userLocation.latitude]);

    try {
      // تنظیم توکن دسترسی Mapbox
      mapboxgl.accessToken = DEMO_TOKEN;
      
      // ایجاد نقشه
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation.longitude, userLocation.latitude],
        zoom: zoom,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false // Allow map to render even with performance issues
      });

      // Listen for map load event
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapError(null);
        setMapInitialized(true);
        
        // Add user and driver markers after map loads
        addUserMarker();
        addDriverMarkers();
      });
      
      // Listen for error event
      map.current.on('error', (e) => {
        console.error("Map error:", e);
        setMapError("خطا در بارگذاری نقشه. لطفاً مرورگر خود را بروزرسانی کنید یا از مرورگر دیگری استفاده کنید.");
      });

      // اضافه کردن کنترل‌های جهت‌یابی به نقشه
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
      
      // زوم تغییر می کند
      map.current.on('zoom', () => {
        if (map.current) {
          setZoom(map.current.getZoom());
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError("خطا در بارگذاری نقشه. لطفاً مرورگر خود را بروزرسانی کنید یا از مرورگر دیگری استفاده کنید.");
      return false;
    }
  };

  // Add user marker
  const addUserMarker = () => {
    if (!map.current || !userLocation) return;
    
    try {
      // اضافه کردن نشانگر موقعیت کاربر
      const userEl = document.createElement('div');
      userEl.className = 'user-marker';
      userEl.innerHTML = `
        <div class="bg-primary rounded-full p-2 shadow-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
      `;
      
      if (userMarker.current) {
        userMarker.current.remove();
      }
      
      userMarker.current = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current);
        
      console.log("User marker added at:", userLocation);
    } catch (error) {
      console.error("Error adding user marker:", error);
    }
  };

  // اضافه کردن نشانگرهای راننده‌ها
  const addDriverMarkers = () => {
    if (!map.current || !userLocation || !map.current.loaded()) {
      console.log("Cannot add driver markers: map or userLocation missing or map not loaded");
      return;
    }
    
    try {
      console.log("Adding markers for", drivers.length, "drivers");
      
      // حذف نشانگرهای قبلی
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // اضافه کردن نشانگر برای هر راننده
      drivers.forEach(driver => {
        // محاسبه فاصله تصادفی در شعاع 5 کیلومتری
        const getRandomOffset = () => (Math.random() - 0.5) * 0.09; // تقریباً 5 کیلومتر
        
        const driverLng = userLocation.longitude + getRandomOffset();
        const driverLat = userLocation.latitude + getRandomOffset();
        
        // ایجاد نشانگر سفارشی برای راننده
        const el = document.createElement('div');
        el.className = `driver-marker ${selectedDriver && selectedDriver.id === driver.id ? 'selected-driver' : ''}`;
        el.innerHTML = `
          <div class="bg-white rounded-full p-2 shadow-md ${selectedDriver && selectedDriver.id === driver.id ? 'ring-2 ring-primary scale-110' : ''}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
        `;
        
        // ایجاد نشانگر و اضافه کردن به نقشه
        const marker = new mapboxgl.Marker(el)
          .setLngLat([driverLng, driverLat])
          .addTo(map.current);
        
        // ذخیره نشانگر برای حذف بعدی
        markers.current.push(marker);
        
        // نمایش popup با اطلاعات اولیه راننده
        const popup = new mapboxgl.Popup({ 
          offset: 25, 
          closeButton: false,
          className: 'driver-popup'
        }).setHTML(
          `<div class="p-2">
            <p class="font-bold">${driver.name}</p>
            <p>${driver.vehicle.model} - ${driver.vehicle.color}</p>
          </div>`
        );
        
        // کلیک روی نشانگر برای انتخاب راننده
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log("Driver selected:", driver.name);
          if (onSelectDriver) {
            onSelectDriver(driver);
          }
        });
        
        // نمایش popup با hover
        el.addEventListener('mouseenter', () => {
          marker.setPopup(popup);
          popup.addTo(map.current!);
        });
        
        el.addEventListener('mouseleave', () => {
          popup.remove();
        });
      });
    } catch (error) {
      console.error("Error adding driver markers:", error);
    }
  };

  // Render a fallback static map when WebGL is not available
  const renderStaticMap = () => {
    if (!userLocation) return null;
    
    try {
      const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${
        userLocation.longitude
      },${userLocation.latitude},13,0/600x400?access_token=${DEMO_TOKEN}`;
      
      return (
        <div className="relative h-full flex flex-col items-center">
          <img 
            src={staticMapUrl} 
            alt="Static Map" 
            className="w-full h-full object-cover"
            onError={() => setMapError("خطا در بارگذاری نقشه استاتیک")}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-primary rounded-full p-3 shadow-md">
              <MapPin className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering static map:", error);
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-center">خطا در نمایش نقشه</p>
        </div>
      );
    }
  };

  // هنگامی که userLocation یا drivers تغییر می‌کنند، نقشه را بروزرسانی کنید
  useEffect(() => {
    console.log("useEffect triggered with userLocation:", userLocation);
    
    // If no user location yet, don't do anything
    if (!userLocation) {
      console.log("No user location yet, skipping map initialization");
      return;
    }
    
    // Clean up previous map instance if it exists
    if (map.current) {
      console.log("Cleaning up existing map instance");
      map.current.remove();
      map.current = null;
    }
    
    // Small delay to ensure the container is ready
    const timer = setTimeout(() => {
      console.log("Attempting to initialize map after delay");
      const success = initializeMap();
      if (!success) {
        console.log("Map initialization failed, will use fallback");
      }
    }, 500);
    
    // پاکسازی نقشه هنگام unmount
    return () => {
      clearTimeout(timer);
      if (map.current) {
        console.log("Cleaning up map on unmount");
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation]);

  // update markers when drivers or selected driver changes
  useEffect(() => {
    if (map.current && map.current.loaded() && userLocation) {
      console.log("Updating markers for drivers or selection change");
      addDriverMarkers();
    }
  }, [drivers, selectedDriver, mapInitialized]);

  // اگر در حال بارگذاری هستیم یا موقعیت کاربر وجود ندارد
  if (isLoading || !userLocation) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* ظرف نقشه */}
      <div 
        id="map-container"
        ref={mapContainer} 
        className="absolute inset-0 bg-blue-50"
      ></div>
      
      {/* نمایش خطا اگر وجود داشته باشد */}
      {mapError && (
        <Alert className="absolute top-4 left-4 right-4 bg-white/90 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{mapError}</AlertDescription>
        </Alert>
      )}
      
      {/* نمایش نقشه استاتیک اگر نقشه اصلی با خطا مواجه شد */}
      {mapError && renderStaticMap()}

      {/* کنترل‌های زوم نقشه */}
      <Card className="absolute top-4 right-4 p-2 flex space-x-2">
        <button 
          className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm tap-effect"
          onClick={() => map.current && map.current.zoomIn()}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button 
          className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm tap-effect"
          onClick={() => map.current && map.current.zoomOut()}
        >
          <Minus className="h-4 w-4" />
        </button>
      </Card>
    </div>
  );
};

export default MapView;
