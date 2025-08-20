import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Satellite,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Navigation,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { encroachmentAPI, Encroachment } from "@/services/api";
import { branding } from "@/config/branding";

export default function EncroachmentMap() {
  const [encroachments, setEncroachments] = useState<Encroachment[]>([]);
  const [filteredEncroachments, setFilteredEncroachments] = useState<
    Encroachment[]
  >([]);
  const [selectedEncroachment, setSelectedEncroachment] =
    useState<Encroachment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    minConfidence: 0,
    searchLocation: "",
  });
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.209 }); // Delhi coordinates
  const [mapZoom, setMapZoom] = useState(10);
  const [showSatelliteView, setShowSatelliteView] = useState(false);

  useEffect(() => {
    fetchEncroachments();

    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapZoom(12);
        },
        () => {
          // Default to Delhi if location access denied
          console.log("Location access denied, using default location");
        },
      );
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [encroachments, filters]);

  const fetchEncroachments = async () => {
    try {
      const data = await encroachmentAPI.getEncroachments();
      setEncroachments(data);
    } catch (error) {
      // Mock data for demo
      const mockData: Encroachment[] = [
        {
          id: "1",
          location: "Sector 18, Noida",
          coordinates: { lat: 28.5355, lng: 77.391 },
          detectedAt: "2024-01-15T08:00:00Z",
          confidence: 87,
          status: "new",
          area: 250,
          satelliteImageUrl: "/placeholder-satellite.jpg",
        },
        {
          id: "2",
          location: "Gurgaon Industrial Area",
          coordinates: { lat: 28.4595, lng: 77.0266 },
          detectedAt: "2024-01-14T12:00:00Z",
          confidence: 93,
          status: "verified",
          area: 180,
          satelliteImageUrl: "/placeholder-satellite.jpg",
        },
        {
          id: "3",
          location: "Faridabad Agricultural Zone",
          coordinates: { lat: 28.4089, lng: 77.3178 },
          detectedAt: "2024-01-13T16:30:00Z",
          confidence: 76,
          status: "resolved",
          area: 320,
          satelliteImageUrl: "/placeholder-satellite.jpg",
        },
        {
          id: "4",
          location: "Delhi Cantonment",
          coordinates: { lat: 28.5665, lng: 77.143 },
          detectedAt: "2024-01-12T09:45:00Z",
          confidence: 91,
          status: "new",
          area: 145,
          satelliteImageUrl: "/placeholder-satellite.jpg",
        },
      ];
      setEncroachments(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...encroachments];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((e) => e.status === filters.status);
    }

    // Confidence filter
    filtered = filtered.filter((e) => e.confidence >= filters.minConfidence);

    // Location search
    if (filters.searchLocation.trim()) {
      filtered = filtered.filter((e) =>
        e.location.toLowerCase().includes(filters.searchLocation.toLowerCase()),
      );
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "7d":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          filterDate.setDate(now.getDate() - 90);
          break;
      }

      filtered = filtered.filter((e) => new Date(e.detectedAt) >= filterDate);
    }

    setFilteredEncroachments(filtered);
  };

  const handleEncroachmentClick = (encroachment: Encroachment) => {
    setSelectedEncroachment(encroachment);
    setMapCenter(encroachment.coordinates);
    setMapZoom(15);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "destructive";
      case "verified":
        return "default";
      case "resolved":
        return "outline";
      case "false_positive":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertTriangle className="h-3 w-3" />;
      case "verified":
        return <Eye className="h-3 w-3" />;
      case "resolved":
        return <CheckCircle className="h-3 w-3" />;
      case "false_positive":
        return <Clock className="h-3 w-3" />;
      default:
        return <MapPin className="h-3 w-3" />;
    }
  };

  const stats = {
    total: encroachments.length,
    new: encroachments.filter((e) => e.status === "new").length,
    verified: encroachments.filter((e) => e.status === "verified").length,
    resolved: encroachments.filter((e) => e.status === "resolved").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading encroachment data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold skyeye-gradient-text flex items-center gap-2">
            <Satellite className="h-8 w-8" />
            Encroachment Detection Map
          </h1>
          <p className="text-muted-foreground">
            Real-time satellite monitoring and AI-powered encroachment detection
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    New
                  </p>
                  <p className="text-2xl font-bold text-red-600">{stats.new}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verified
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.verified}
                  </p>
                </div>
                <Eye className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.resolved}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Search */}
                <div>
                  <label className="text-sm font-medium">Search Location</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter location..."
                      value={filters.searchLocation}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          searchLocation: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="false_positive">
                        False Positive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) =>
                      setFilters({ ...filters, dateRange: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Confidence Filter */}
                <div>
                  <label className="text-sm font-medium">
                    Min Confidence: {filters.minConfidence}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minConfidence}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minConfidence: parseInt(e.target.value),
                      })
                    }
                    className="w-full mt-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Map Controls */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSatelliteView(!showSatelliteView)}
                    className="w-full flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    {showSatelliteView ? "Street View" : "Satellite View"}
                  </Button>
                </div>

                {/* Results Count */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredEncroachments.length} of{" "}
                    {encroachments.length} encroachments
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Interactive Map Placeholder */}
            <Card>
              <CardContent className="p-0">
                <div className="h-96 lg:h-[500px] rounded-lg overflow-hidden relative bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20">
                  {/* Map View Controls */}
                  <div className="absolute top-4 right-4 z-10 space-y-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Map Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg shadow-lg max-w-md">
                        <Satellite className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Interactive Map View
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Map centered at: {mapCenter.lat.toFixed(4)},{" "}
                          {mapCenter.lng.toFixed(4)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          View mode:{" "}
                          {showSatelliteView ? "Satellite" : "Street"} | Zoom:{" "}
                          {mapZoom}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mock Markers */}
                  {filteredEncroachments.map((encroachment, index) => (
                    <div
                      key={encroachment.id}
                      className="absolute"
                      style={{
                        left: `${20 + index * 15}%`,
                        top: `${30 + index * 10}%`,
                      }}
                    >
                      <Button
                        size="sm"
                        variant={
                          encroachment.status === "new"
                            ? "destructive"
                            : "default"
                        }
                        className="h-8 w-8 p-0 rounded-full animate-pulse"
                        onClick={() => handleEncroachmentClick(encroachment)}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Encroachment List */}
            <Card>
              <CardHeader>
                <CardTitle>Detected Encroachments</CardTitle>
                <CardDescription>
                  Click on any item to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEncroachments.map((encroachment) => (
                    <div
                      key={encroachment.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleEncroachmentClick(encroachment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {encroachment.location}
                            </h4>
                            <Badge
                              variant={
                                getStatusColor(encroachment.status) as any
                              }
                              className="text-xs"
                            >
                              {getStatusIcon(encroachment.status)}
                              {encroachment.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Confidence:</span>{" "}
                              {encroachment.confidence}%
                            </div>
                            <div>
                              <span className="font-medium">Area:</span>{" "}
                              {encroachment.area} m²
                            </div>
                            <div>
                              <span className="font-medium">Detected:</span>{" "}
                              {new Date(
                                encroachment.detectedAt,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Encroachment Details */}
            {selectedEncroachment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Encroachment Details</span>
                    <Badge
                      variant={
                        getStatusColor(selectedEncroachment.status) as any
                      }
                    >
                      {getStatusIcon(selectedEncroachment.status)}
                      {selectedEncroachment.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Location</h4>
                        <p className="text-muted-foreground">
                          {selectedEncroachment.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEncroachment.coordinates.lat.toFixed(6)},{" "}
                          {selectedEncroachment.coordinates.lng.toFixed(6)}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold">Detection Details</h4>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Confidence
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${selectedEncroachment.confidence}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {selectedEncroachment.confidence}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Area
                            </p>
                            <p className="font-medium">
                              {selectedEncroachment.area} m²
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold">Detected</h4>
                        <p className="text-muted-foreground">
                          {new Date(
                            selectedEncroachment.detectedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Satellite Imagery</h4>
                      <div className="relative">
                        <img
                          src={`https://via.placeholder.com/400x300/22c55e/ffffff?text=Satellite+Image+${selectedEncroachment.id}`}
                          alt="Satellite view"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Satellite View
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
