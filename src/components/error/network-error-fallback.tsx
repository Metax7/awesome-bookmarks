"use client";

import React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NetworkErrorFallbackProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
  showOfflineIndicator?: boolean;
}

export function NetworkErrorFallback({
  onRetry,
  title = "No internet connection",
  description = "Check your network connection and try again.",
  showOfflineIndicator = true,
}: NetworkErrorFallbackProps) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline && onRetry) {
      onRetry();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {showOfflineIndicator && !isOnline ? (
            <WifiOff className="h-12 w-12 text-destructive" />
          ) : (
            <Wifi className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <CardTitle className={!isOnline ? "text-destructive" : ""}>
          {!isOnline ? "No connection" : title}
        </CardTitle>
        <CardDescription>
          {!isOnline ? "Internet connection is unavailable" : description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleRetry}
          disabled={!isOnline}
          className="w-full"
          variant={isOnline ? "default" : "outline"}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isOnline ? "Try again" : "Waiting for connection..."}
        </Button>

        {showOfflineIndicator && (
          <div className="mt-4 text-center">
            <div
              className={`inline-flex items-center gap-2 text-sm ${
                isOnline ? "text-green-600" : "text-destructive"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-600" : "bg-destructive"
                }`}
              />
              {isOnline ? "Connected" : "Disconnected"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
