import { useState, useEffect, useCallback } from 'react';

export const useMouseTracking = (throttleMs = 100) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  const handleMouseMove = useCallback((e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    });
  }, []);
  
  useEffect(() => {
    let timeoutId;
    
    const throttledMouseMove = (e) => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleMouseMove(e);
        timeoutId = null;
      }, throttleMs);
    };
    
    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleMouseMove, throttleMs]);
  
  return mousePosition;
};