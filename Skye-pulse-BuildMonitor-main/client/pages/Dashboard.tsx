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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Users,
  FileText,
  TrendingUp,
  Satellite,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AlertsPanel from "@/components/AlertsPanel";
import { branding } from "@/config/branding";
import { reportsAPI, encroachmentAPI, analyticsAPI, Report, Encroachment } from "@/services/api";

// Remove local interface definitions since we're importing from API
export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [encroachments, setEncroachments] = useState<Encroachment[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    totalEncroachments: 0,
    newEncroachments: 0,
    alertsCount: 0,
  });

  useEffect(() => {
    fetchAllData();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setError(null);
      await Promise.all([
        fetchReports(),
        fetchEncroachments(),
        fetchDashboardStats(),
      ]);
    } catch (error) {
      setError("Failed to fetch dashboard data. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAllData();
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await reportsAPI.getReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setError("Failed to load reports. Please check your connection and try again.");
      throw error;
    }
  };

  const fetchEncroachments = async () => {
    try {
      const data = await encroachmentAPI.getEncroachments();
      setEncroachments(data);
    } catch (error) {
      console.error("Failed to fetch encroachments:", error);
      setError("Failed to load encroachments. Please check your connection and try again.");
      throw error;
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const data = await analyticsAPI.getDashboardStats();
      setDashboardStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      // Calculate from local data as fallback
      setDashboardStats({
        totalReports: reports.length,
        pendingReports: reports.filter((r) => r.status === "pending").length,
        approvedReports: reports.filter((r) => r.status === "approved").length,
        rejectedReports: reports.filter((r) => r.status === "rejected").length,
        totalEncroachments: encroachments.length,
        newEncroachments: encroachments.filter((e) => e.status === "new").length,
        alertsCount: 0,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (
    reportId: string,
    action: "approve" | "reject",
  ) => {
    try {
      await reportsAPI.updateReportStatus(
        reportId,
        action === "approve" ? "approved" : "rejected",
      );

      // Update local state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: action === "approve" ? "approved" : "rejected",
              }
            : report,
        ),
      );

      toast({
        title: "Report updated",
        description: `Report ${action}d successfully`,
      });

      // Refresh stats
      await fetchDashboardStats();
    } catch (error) {
      console.error(`Failed to ${action} report:`, error);
      toast({
        title: "Action failed",
        description: `Failed to ${action} report. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === "pending").length,
    approvedReports: reports.filter((r) => r.status === "approved").length,
    totalEncroachments: encroachments.length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-destructive/10 p-3 rounded-full">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Connection Error
            </h2>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold skyeye-gradient-text">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">{branding.tagline}</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Reports
                </p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </p>
                <p className="text-2xl font-bold">{stats.pendingReports}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-bold">{stats.approvedReports}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Encroachments
                </p>
                <p className="text-2xl font-bold">{stats.totalEncroachments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Citizen-submitted encroachment reports requiring review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citizen</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.citizenName}
                  </TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(report.priority) as any}>
                      {report.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                            <DialogDescription>
                              Submitted by {selectedReport?.citizenName}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedReport && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">Location</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReport.location}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReport.description}
                                </p>
                              </div>
                              {selectedReport.imageUrl && (
                                <div>
                                  <h4 className="font-medium">Image</h4>
                                  <img
                                    src={selectedReport.imageUrl}
                                    alt="Report evidence"
                                    className="w-full h-48 object-cover rounded-md border"
                                  />
                                </div>
                              )}
                              {selectedReport.status === "pending" && (
                                <div className="flex space-x-2 pt-4">
                                  <Button
                                    onClick={() =>
                                      handleReportAction(
                                        selectedReport.id,
                                        "approve",
                                      )
                                    }
                                    className="flex-1"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleReportAction(
                                        selectedReport.id,
                                        "reject",
                                      )
                                    }
                                    className="flex-1"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {report.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleReportAction(report.id, "approve")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleReportAction(report.id, "reject")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {/* Recent Reports would go here if we were restructuring */}
        </div>
        <div className="lg:col-span-1">
          <AlertsPanel />
        </div>
      </div>

      {/* Detected Encroachments */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Encroachments</CardTitle>
          <CardDescription>
            Automatically detected from satellite imagery analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encroachments.map((encroachment) => (
                <TableRow key={encroachment.id}>
                  <TableCell className="font-medium">
                    {encroachment.location}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${encroachment.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">
                        {encroachment.confidence}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        encroachment.status === "new"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {encroachment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(encroachment.detectedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      View on Map
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
