// wavesync_web/src/components/Reveal.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  staggerIndex?: number; // index in a list to stagger by +90ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // pixels, default 20
  duration?: number; // ms, default 650
  style?: React.CSSProperties;
  threshold?: number;
  as?: React.ElementType;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delay = 0,
  staggerIndex = 0,
  direction = 'up',
  distance = 20,
  duration = 650,
  style = {},
  threshold = 0.12,
  as: Component = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            // Reset when scrolled out of view so animation plays every time on scroll up or down
            setIsVisible(false);
          }
        });
      },
      {
        threshold: Math.min(threshold, 0.08),
        rootMargin: '0px 0px -25px 0px',
      }
    );

    const el = ref.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  const computedDelay = useMemo(() => {
    return delay + staggerIndex * 85;
  }, [delay, staggerIndex]);

  const transformStyle = useMemo(() => {
    if (prefersReducedMotion) return 'none';
    if (isVisible) return 'translate3d(0, 0, 0)';

    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'none':
      default:
        return 'none';
    }
  }, [direction, distance, isVisible, prefersReducedMotion]);

  const animationStyle: React.CSSProperties = {
    ...style,
    opacity: prefersReducedMotion ? 1 : isVisible ? 1 : 0,
    transform: transformStyle,
    transitionProperty: prefersReducedMotion ? 'none' : 'opacity, transform',
    transitionDuration: prefersReducedMotion ? '0ms' : isVisible ? `${duration}ms` : '200ms',
    transitionDelay: prefersReducedMotion ? '0ms' : isVisible ? `${computedDelay}ms` : '0ms',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'opacity, transform',
  };

  return (
    <Component
      ref={ref}
      className={`reveal-item ${className} ${isVisible ? 'revealed' : ''}`}
      style={animationStyle}
    >
      {children}
    </Component>
  );
};
