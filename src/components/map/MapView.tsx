
import React, { useEffect, useRef, useState } from 'react';
import { Driver, Location } from '../../utils/types';
import { Card } from '@/components/ui/card';
import { Car, Plus, Minus } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  userLocation: Location | null;
  drivers: Driver[];
  selectedDriver: Driver | null;
  isLoading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  userLocation, 
  drivers, 
  selectedDriver,
  isLoading = false 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(true);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // تابع برای ایجاد نقشه
  const initializeMap = (token: string) => {
    if (!mapContainer.current || !userLocation) return;

    // تنظیم توکن دسترسی Mapbox
    mapboxgl.accessToken = token;
    
    try {
      // ایجاد نقشه
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13
      });

      // اضافه کردن کنترل‌های جهت‌یابی به نقشه
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
      
      // نشانگر موقعیت کاربر
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current);

      // اضافه کردن نشانگرهای راننده‌ها
      addDriverMarkers();
      
      map.current.on('load', () => {
        // هر عملیات دیگری که بعد از load نقشه باید انجام شود
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // اضافه کردن نشانگرهای راننده‌ها
  const addDriverMarkers = () => {
    if (!map.current) return;
    
    // حذف نشانگرهای قبلی
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // اضافه کردن نشانگر برای هر راننده
    drivers.forEach(driver => {
      // برای مثال، کمی فاصله از موقعیت کاربر ایجاد می‌کنیم
      // در یک برنامه واقعی، موقعیت واقعی راننده‌ها از سرور دریافت می‌شود
      const randomOffset = () => (Math.random() - 0.5) * 0.01;
      
      if (!userLocation) return;
      
      const driverLng = userLocation.longitude + randomOffset();
      const driverLat = userLocation.latitude + randomOffset();
      
      // ایجاد نشانگر سفارشی برای راننده
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.innerHTML = `
        <div class="bg-white rounded-full p-2 shadow-md ${selectedDriver && selectedDriver.id === driver.id ? 'ring-2 ring-primary scale-125' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        </div>
      `;
      
      // اضافه کردن کلاس‌های انتخاب شده
      if (selectedDriver && selectedDriver.id === driver.id) {
        el.classList.add('selected-driver');
      }
      
      // ایجاد نشانگر و اضافه کردن به نقشه
      const marker = new mapboxgl.Marker(el)
        .setLngLat([driverLng, driverLat])
        .addTo(map.current);
      
      // ذخیره نشانگر برای حذف بعدی
      markers.current.push(marker);
      
      // اضافه کردن popup برای نمایش اطلاعات راننده
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <p class="font-bold">${driver.name}</p>
          <p>${driver.vehicle.model} - ${driver.vehicle.plate}</p>
          <p>امتیاز: ${driver.rating}/5</p>
        </div>`
      );
      
      // نمایش popup با کلیک روی نشانگر
      el.addEventListener('click', () => {
        marker.setPopup(popup);
        popup.addTo(map.current!);
      });
    });
  };

  // هنگامی که userLocation یا drivers تغییر می‌کنند، نقشه را بروزرسانی کنید
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.setCenter([userLocation.longitude, userLocation.latitude]);
      addDriverMarkers();
    } else if (mapboxToken && userLocation && !map.current) {
      initializeMap(mapboxToken);
    }
  }, [userLocation, drivers, selectedDriver, mapboxToken]);

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

  // اگر توکن Mapbox وارد نشده است
  if (showTokenInput) {
    return (
      <div className="h-full bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-5 rounded-lg shadow-md max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">توکن Mapbox مورد نیاز است</h3>
          <p className="mb-4 text-sm text-gray-600">
            برای استفاده از نقشه، لطفا توکن عمومی Mapbox خود را وارد کنید. این توکن را می‌توانید از 
            <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary"> حساب Mapbox </a>
            خود دریافت کنید.
          </p>
          <input
            type="text"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="توکن عمومی Mapbox را وارد کنید"
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={() => {
              if (mapboxToken) {
                setShowTokenInput(false);
                initializeMap(mapboxToken);
              }
            }}
            className="w-full bg-primary text-white p-2 rounded hover:bg-primary/90"
          >
            تأیید
          </button>
        </div>
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
          className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm"
          onClick={() => map.current && map.current.zoomIn()}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button 
          className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm"
          onClick={() => map.current && map.current.zoomOut()}
        >
          <Minus className="h-4 w-4" />
        </button>
      </Card>
    </div>
  );
};

export default MapView;
