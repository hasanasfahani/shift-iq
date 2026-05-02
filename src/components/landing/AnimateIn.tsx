'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  threshold?: number;
}

export default function AnimateIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 20,
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduced) { setVisible(true); return; }
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, reduced]);

  const getHiddenTransform = (): string => {
    switch (direction) {
      case 'up':    return `translateY(${distance}px)`;
      case 'down':  return `translateY(-${distance}px)`;
      case 'left':  return `translateX(${distance}px)`;
      case 'right': return `translateX(-${distance}px)`;
      case 'none':  return 'none';
    }
  };

  const style: CSSProperties = reduced
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : getHiddenTransform(),
        transition: `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`,
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
