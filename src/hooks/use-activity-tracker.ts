import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export function useActivityTracker() {
  const { address, isConnected } = useAccount();
  const previousAddressRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      previousAddressRef.current = null;
      return;
    }

    // Clear previous wallet's activity when switching
    const clearPreviousActivity = async (oldAddress: string) => {
      try {
        await fetch('/api/users/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: oldAddress, clear: true })
        });
      } catch (error) {
        console.error('Error clearing old activity:', error);
      }
    };

    if (previousAddressRef.current && previousAddressRef.current !== address) {
      clearPreviousActivity(previousAddressRef.current);
    }

    previousAddressRef.current = address;

    const updateActivity = async () => {
      try {
        await fetch('/api/users/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        });
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    };

    // Update immediately
    updateActivity();

    // Update every 2 minutes while user is active
    const interval = setInterval(updateActivity, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
      // Clear activity when component unmounts or wallet disconnects
      if (address) {
        clearPreviousActivity(address);
      }
    };
  }, [address, isConnected]);
}

