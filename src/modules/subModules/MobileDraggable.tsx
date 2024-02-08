import { ReactNode, useRef, useState, useEffect } from "react";

const MobileDraggable: React.FC<{children: ReactNode}> = ({children}) => {
  const maxHeight = window.innerHeight / 10 * 8; //80% 높이
  const minHeight = window.innerHeight / 10 * 2; //20% 높이
  const touchSize = `${window.innerHeight / 30}px`;

  const ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (ref.current && e.touches.length === 1) {
        const rect = headerRef.current.getBoundingClientRect();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        if(touchX >= rect.left &&
          touchX <= rect.right &&
          touchY >= rect.top &&
          touchY <= rect.bottom
        ) {
          setIsDragging(true);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && ref.current && e.touches.length === 1) {
        e.preventDefault();

        const touchY = e.touches[0].clientY;
        const rect = ref.current.getBoundingClientRect();
        let newHeight = Math.max(0, rect.bottom - touchY);
        newHeight = Math.min(newHeight, maxHeight);
        newHeight = Math.max(newHeight, minHeight);
        ref.current.style.height = `${newHeight}px`;
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (ref.current) {
      ref.current.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('touchstart', handleTouchStart);
      }
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return(
    <div ref={ref} className="MobileDraggable">
      <div ref={headerRef} style={{height: touchSize, background: 'black', opacity: 0.3}}/>
      <div className="position-relative h-100">
        {children}
      </div>
    </div>
  )
}

export default MobileDraggable;