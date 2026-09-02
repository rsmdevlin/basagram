'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      socketInstance = io(apiUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (token && userId) {
          socketInstance?.emit('user:online', { userId });
        }
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket.io error:', error);
      });
    }

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  return { socket: socketInstance, isConnected };
}
