import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export function PullToRefresh({ children, onRefresh }) {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const threshold = 120; // How far to pull down before refreshing
  const containerRef = useRef(null);

  useEffect(() => {
    // Only apply to touch devices
    if (!('ontouchstart' in window)) return;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && startY > 0 && !refreshing) {
        const y = e.touches[0].clientY;
        const dist = y - startY;
        
        if (dist > 0) {
          // We are pulling down
          setPulling(true);
          setPullDistance(Math.min(dist * 0.5, threshold + 20)); // Add friction
          
          if (dist > 10) {
            e.preventDefault(); // Prevent default browser overscroll only when actively pulling
          }
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pulling) {
        if (pullDistance > threshold && !refreshing) {
          setRefreshing(true);
          setPullDistance(50); // Keep indicator visible while refreshing
          
          if (onRefresh) {
            await onRefresh();
          } else {
            // Default action if no onRefresh provided
            window.location.reload();
          }
          
          setRefreshing(false);
        }
        
        // Reset state
        setPullDistance(0);
        setPulling(false);
        setStartY(0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [startY, pulling, pullDistance, refreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full touch-pan-y">
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center overflow-hidden transition-all duration-200 ease-out z-40 pointer-events-none"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pulling || refreshing ? 1 : 0 
        }}
      >
        <div className="mt-4 bg-white rounded-full shadow-md p-2 flex items-center justify-center transform transition-transform duration-200 w-10 h-10 border border-gray-100">
          <RefreshCw 
            className={`w-5 h-5 text-[#0066cc] ${refreshing ? 'animate-spin' : ''}`} 
            style={{ 
              transform: `rotate(${Math.min(pullDistance * 3, 360)}deg)` 
            }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="transition-transform duration-200 ease-out h-full"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
