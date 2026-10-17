// wavesync_web/src/components/Reveal.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  staggerIndex?: number; // index in a list to stagger
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // pixels, default 18
  duration?: number; // ms, default 440
  style?: React.CSSProperties;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  as?: React.ElementType;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delay = 0,
  staggerIndex = 0,
  direction = 'up',
  distance = 18,
  duration = 440,
  style = {},
  threshold = 0.05,
  rootMargin = '0px 0px 50px 0px',
  once = true,
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

    const el = ref.current;
    if (!el) return;

    // Check if element is already within viewport on initial mount
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top <= windowHeight + 40 && rect.bottom >= 0) {
      setIsVisible(true);
      if (once) return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: Math.min(threshold, 0.05),
        rootMargin,
      }
    );

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [threshold, rootMargin, once]);

  // Cap and wrap stagger so cards in the same row cascade smoothly,
  // while cards further down the page trigger with scroll without long lag
  const computedDelay = useMemo(() => {
    const rowStagger = (staggerIndex % 3) * 45;
    return Math.min(delay + rowStagger, 180);
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
    transitionDuration: prefersReducedMotion ? '0ms' : `${duration}ms`,
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

