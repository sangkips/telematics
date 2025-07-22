import React, { useState, useRef, useEffect } from 'react';
import { Car, Fuel, TrendingUp, AlertTriangle } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

interface StatsCarouselProps {
  stats: {
    totalVehicles: number;
    activeVehicles: number;
    idleVehicles: number;
    maintenanceVehicles: number;
    averageFuelLevel: number;
    totalDistance: number;
    fuelTheftIncidents: number;
  };
}

export const StatsCarousel: React.FC<StatsCarouselProps> = ({ stats }) => {
  const { isMobile, isTablet } = useResponsive();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const statCards: StatCard[] = [
    {
      id: 'total-vehicles',
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      subtitle: `${stats.activeVehicles} active, ${stats.idleVehicles} idle`,
      icon: Car,
      iconColor: 'text-blue-400',
    },
    {
      id: 'avg-fuel',
      title: 'Avg Fuel Level',
      value: `${stats.averageFuelLevel}%`,
      subtitle: 'Fleet average fuel efficiency',
      icon: Fuel,
      iconColor: 'text-green-400',
    },
    {
      id: 'total-distance',
      title: 'Total Distance',
      value: `${(stats.totalDistance / 1000).toFixed(1)}k`,
      subtitle: 'Kilometers driven this month',
      icon: TrendingUp,
      iconColor: 'text-purple-400',
    },
    {
      id: 'theft-incidents',
      title: 'Theft Incidents',
      value: stats.fuelTheftIncidents,
      subtitle: 'Detected fuel theft cases',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
    },
  ];

  // Touch/Mouse event handlers for swipe functionality
  const handleStart = (clientX: number) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(clientX);
    if (carouselRef.current) {
      setScrollLeft(carouselRef.current.scrollLeft);
    }
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !isMobile || !carouselRef.current) return;
    
    const x = clientX;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleEnd = () => {
    if (!isMobile) return;
    setIsDragging(false);
    
    // Snap to nearest card
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(carouselRef.current.scrollLeft / cardWidth);
      setCurrentIndex(Math.max(0, Math.min(newIndex, statCards.length - 1)));
      
      carouselRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Scroll to specific card
  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  };

  // Update current index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current || isDragging) return;
      
      const cardWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(carouselRef.current.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [isDragging]);

  // Render grid layout for tablet and desktop
  if (!isMobile) {
    const gridCols = isTablet ? 'grid-cols-2' : 'grid-cols-4';
    
    return (
      <div className={`grid ${gridCols} gap-6`}>
        {statCards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>
    );
  }

  // Render carousel for mobile
  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {statCards.map((card, index) => (
          <div
            key={card.id}
            className="flex-none w-full snap-center px-3 first:pl-0 last:pr-0"
          >
            <StatCard card={card} />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {statCards.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToCard(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-blue-400'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to stat ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Individual stat card component
const StatCard: React.FC<{ card: StatCard }> = ({ card }) => {
  const { Icon } = { Icon: card.icon };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[120px] touch-manipulation">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{card.title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {card.value}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${card.iconColor}`} />
      </div>
      <div className="mt-4 text-sm text-gray-400">
        {card.subtitle}
      </div>
    </div>
  );
};