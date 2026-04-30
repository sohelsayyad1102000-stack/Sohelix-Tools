import React, { useEffect, useRef } from 'react';
import { trackEvent } from '../lib/analytics';

interface AnalyticsTrackerProps {
  toolName: string;
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ toolName }) => {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 2) { // Only track if they stayed more than 2 seconds
        trackEvent('tool_engagement', {
          tool_name: toolName,
          duration_seconds: duration
        });
      }
    };
  }, [toolName]);

  return null;
};
