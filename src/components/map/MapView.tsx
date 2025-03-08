
import React, { useEffect, useRef, useState } from 'react';
import { Driver, Location } from '../../utils/types';
import { Card } from '@/components/ui/card';
import { Car, Plus, Minus, MapPin } from 'lucide-react';
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
  const [zoom, setZoom] = useState<number>(13);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  // استفاده از یک توکن موقت برای نمایش - در محیط واقعی باید از روش‌های امن‌تری استفاده شود
  // این توکن محدود شده و فقط برای نمایش اولیه است
  const DEMO_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2x0NXBmM2M1MDluNTJrcGM4amk1ZmR1MSJ9.a3rRII3S79F-vW7BtqnLOQ';
  
  // تابع برای ایجاد نقشه
  const initializeMap = () => {
    if (!mapContainer.current || !userLocation) return;

    // تنظیم توکن دسترسی Mapbox
    mapboxgl.accessToken = DEMO_TOKEN;
    
    try {
      // ایجاد نقشه
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation.longitude, userLocation.latitude],
        zoom: zoom
      });

      // اضافه کردن کنترل‌های جهت‌یابی به نقشه
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
      
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
      
      userMarker.current = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current);

      // اضافه کردن نشانگرهای راننده‌ها
      addDriverMarkers();
      
      map.current.on('load', () => {
        // نقشه بارگذاری شده است
      });

      // زوم تغییر می کند
      map.current.on('zoom', () => {
        if (map.current) {
          setZoom(map.current.getZoom());
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // اضافه کردن نشانگرهای راننده‌ها
  const addDriverMarkers = () => {
    if (!map.current || !userLocation) return;
    
    // حذف نشانگرهای قبلی
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // اضافه کردن نشانگر برای هر راننده با مختصات شبیه‌سازی شده
    // در یک برنامه واقعی، مختصات واقعی راننده‌ها از سرور دریافت می‌شود
    drivers.forEach(driver => {
      // ایجاد مختصات تصادفی در شعاع 5 کیلومتری کاربر (تقریباً 0.045 درجه)
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
  };

  // هنگامی که userLocation یا drivers تغییر می‌کنند، نقشه را بروزرسانی کنید
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.setCenter([userLocation.longitude, userLocation.latitude]);
      addDriverMarkers();
    } else if (userLocation && !map.current) {
      initializeMap();
    }
  }, [userLocation, drivers, selectedDriver]);

  // update markers when selected driver changes
  useEffect(() => {
    if (map.current) {
      addDriverMarkers();
    }
  }, [selectedDriver]);

  // پاکسازی نقشه هنگام unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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
      <div ref={mapContainer} className="absolute inset-0 bg-blue-50"></div>

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
