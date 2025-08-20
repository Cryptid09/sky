import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellRing,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { alertsAPI, Alert } from "@/services/api";
import { cn } from "@/lib/utils";

interface AlertsPanelProps {
  className?: string;
}

export default function AlertsPanel({ className }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAlerts();

    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await alertsAPI.getAlerts();
      setAlerts(data);
      setUnreadCount(data.filter((alert) => !alert.isRead).length);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      // Don't set mock data, just show empty state
      setAlerts([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await alertsAPI.markAlertRead(alertId);
      setAlerts(
        alerts.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
      toast({
        title: "Action failed",
        description: "Failed to mark alert as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await alertsAPI.markAllAlertsRead();
      setAlerts(alerts.map((alert) => ({ ...alert, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "All alerts marked as read",
        description: "All alerts have been marked as read successfully.",
      });
    } catch (error) {
      console.error("Failed to mark all alerts as read:", error);
      toast({
        title: "Action failed",
        description: "Failed to mark all alerts as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "encroachment_match":
        return "🎯";
      case "high_priority_report":
        return "⚠️";
      case "system_alert":
        return "🛰️";
      default:
        return "📢";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>
          Real-time notifications for matched reports and critical events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts at this time</p>
            <p className="text-sm text-muted-foreground">
              You'll be notified when citizen reports match satellite detections
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:shadow-md",
                    !alert.isRead
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/20",
                    alert.severity === "critical" &&
                      !alert.isRead &&
                      "alert-glow",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getTypeIcon(alert.type)}
                        </span>
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <Badge
                          variant={getSeverityColor(alert.severity) as any}
                          className="text-xs"
                        >
                          {getSeverityIcon(alert.severity)}
                          {alert.severity}
                        </Badge>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {alert.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(alert.createdAt).toLocaleString()}
                          </div>

                          {alert.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alert.location}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {alert.reportId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          )}

                          {!alert.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                              className="text-xs h-6 px-2"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
