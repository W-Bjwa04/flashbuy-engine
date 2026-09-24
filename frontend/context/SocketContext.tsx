'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface OrderNotificationPayload {
    trackingId: string;
    orderId?: string | null;
    userId: string;
    productId: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    reason?: string;
    timestamp: string;
}

export interface OrderNotificationRecord extends OrderNotificationPayload {
    history?: { status: OrderNotificationPayload['status']; timestamp: string; reason?: string }[];
}

interface SocketContextType {
    isConnected: boolean;
    isConnecting: boolean;
    toggleConnection: () => void;
    /** All received notifications, keyed by trackingId for O(1) lookup */
    notifications: Record<string, OrderNotificationRecord>;
    /** Ordered list of all notifications, newest first */
    notificationList: OrderNotificationRecord[];
}

const SocketContext = createContext<SocketContextType>({
    isConnected: false,
    isConnecting: false,
    toggleConnection: () => {},
    notifications: {},
    notificationList: [],
});

export function SocketProvider({
    children,
    accessToken,
}: {
    children: React.ReactNode;
    accessToken?: string | null;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [notifications, setNotifications] = useState<Record<string, OrderNotificationRecord>>({});
    const [notificationList, setNotificationList] = useState<OrderNotificationRecord[]>([]);

    const addNotification = useCallback((data: OrderNotificationPayload) => {
        setNotifications((prev) => {
            const existing = prev[data.trackingId];
            const updatedHistory = existing?.history
                ? [...existing.history, { status: data.status, timestamp: data.timestamp, reason: data.reason }]
                : [{ status: data.status, timestamp: data.timestamp, reason: data.reason }];

            const merged: OrderNotificationRecord = {
                ...existing,
                ...data,
                orderId: data.orderId ?? existing?.orderId ?? null,
                reason: data.reason ?? existing?.reason,
                history: updatedHistory,
            };

            return { ...prev, [data.trackingId]: merged };
        });

        setNotificationList((prev) => {
            const existing = prev.find((n) => n.trackingId === data.trackingId);
            const updatedHistory = existing?.history
                ? [...existing.history, { status: data.status, timestamp: data.timestamp, reason: data.reason }]
                : [{ status: data.status, timestamp: data.timestamp, reason: data.reason }];

            const merged: OrderNotificationRecord = {
                ...existing,
                ...data,
                orderId: data.orderId ?? existing?.orderId ?? null,
                reason: data.reason ?? existing?.reason,
                history: updatedHistory,
            };

            const filtered = prev.filter((n) => n.trackingId !== data.trackingId);
            return [merged, ...filtered];
        });
    }, []);

    const connect = useCallback(() => {
        if (!accessToken) {
            toast.error('Sign in required to enable real-time notifications');
            return;
        }
        if (socket?.connected) return;

        setIsConnecting(true);

        const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4001', {
            auth: { token: accessToken },
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            setIsConnecting(false);
            toast.success('Live notifications connected');
        });

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
            setIsConnecting(false);
            if (reason !== 'io client disconnect') {
                toast.warning('Disconnected from live notifications');
            }
        });

        newSocket.on('connect_error', (err) => {
            setIsConnected(false);
            setIsConnecting(false);
            toast.error(`Connection error: ${err.message}`);
        });

        newSocket.on('order_status_update', (data: OrderNotificationPayload) => {
            addNotification(data);

            if (data.status === 'COMPLETED') {
                toast.success(`Order completed`, {
                    description: `Tracking: ${data.trackingId.slice(0, 8)}…`,
                });
            } else if (data.status === 'FAILED') {
                toast.error(`Order failed`, {
                    description: data.reason ?? 'Transaction aborted',
                });
            } else {
                toast.info(`Order ${data.status.toLowerCase()}`, {
                    description: `Tracking: ${data.trackingId.slice(0, 8)}…`,
                });
            }
        });

        setSocket(newSocket);
    }, [accessToken, socket, addNotification]);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
            setIsConnecting(false);
            toast.info('Notifications disconnected');
        }
    }, [socket]);

    const toggleConnection = useCallback(() => {
        if (isConnected || isConnecting) {
            disconnect();
        } else {
            connect();
        }
    }, [isConnected, isConnecting, connect, disconnect]);

    // Handle accessToken changes (e.g. login/logout/switch account)
    const prevTokenRef = React.useRef(accessToken);
    useEffect(() => {
        if (prevTokenRef.current !== accessToken) {
            prevTokenRef.current = accessToken;
            const wasActive = isConnected;

            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setIsConnected(false);
            setIsConnecting(false);
            setNotifications({});
            setNotificationList([]);

            if (wasActive && accessToken) {
                connect();
            }
        }
    }, [accessToken, socket, isConnected, connect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socket) socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider
            value={{ isConnected, isConnecting, toggleConnection, notifications, notificationList }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}