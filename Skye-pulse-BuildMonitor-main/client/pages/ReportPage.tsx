import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  MapPin,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Navigation,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { reportsAPI, CreateReportRequest } from "@/services/api";
import { branding } from "@/config/branding";

interface LocationCoords {
  lat: number;
  lng: number;
}

export default function ReportPage() {
  const [formData, setFormData] = useState<CreateReportRequest>({
    location: "",
    description: "",
    priority: "medium",
    coordinates: undefined,
    images: [],
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(
    null,
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, location: e.target.value });
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(coords);
        setFormData({
          ...formData,
          coordinates: coords,
          location:
            formData.location ||
            `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        });
        setIsGettingLocation(false);
        toast({
          title: "Location captured",
          description: "Your current location has been added to the report",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location error",
          description:
            "Could not get your current location. Please enter manually.",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB per file

    // Validate file count
    if (selectedImages.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} images allowed`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes and types
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum 10MB per file.`,
          variant: "destructive",
        });
        return false;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...validFiles],
    }));
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.location || !formData.description) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("location", formData.location);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("priority", formData.priority);

      if (formData.coordinates) {
        formDataToSend.append("coordinates", JSON.stringify(formData.coordinates));
      }

      if (formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      await reportsAPI.createReport(formDataToSend);

      toast({
        title: "Report submitted successfully!",
        description: "Thank you for reporting. We'll review your submission.",
      });

      setIsSubmitted(true);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          location: "",
          description: "",
          priority: "medium",
          coordinates: undefined,
          images: [],
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
        setCurrentLocation(null);
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast({
        title: "Submission failed",
        description: "Failed to submit your report. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <FileText className="h-4 w-4" />;
      case "low":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center farmer-card">
          <CardContent className="p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <CheckCircle className="h-12 w-12 text-accent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Report Submitted!
            </h2>
            <p className="text-muted-foreground mb-4">
              Thank you for helping protect our agricultural lands. Your report
              has been received and will be reviewed by our team.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to report form in a moment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold skyeye-gradient-text mb-2">
            Report Encroachment
          </h1>
          <p className="text-muted-foreground">
            Help us protect agricultural land by reporting unauthorized
            construction or land use
          </p>
        </div>

        <Card className="farmer-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Encroachment Details
            </CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help our team
              investigate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    Use Current Location
                  </Button>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter address, coordinates, or landmark"
                    value={formData.location}
                    onChange={handleLocationInput}
                    className="pl-10"
                    required
                  />
                </div>

                {currentLocation && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    📍 GPS: {currentLocation.lat.toFixed(6)},{" "}
                    {currentLocation.lng.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Priority Level
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Low - Minor issue
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Medium - Standard report
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        High - Urgent attention needed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex justify-center">
                  <Badge
                    variant={getPriorityColor(formData.priority) as any}
                    className="flex items-center gap-1"
                  >
                    {getPriorityIcon(formData.priority)}
                    {formData.priority.charAt(0).toUpperCase() +
                      formData.priority.slice(1)}{" "}
                    Priority
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-base font-semibold"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the encroachment issue, including what type of unauthorized activity you observed, when you noticed it, and any other relevant details..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-32"
                  required
                />
                <div className="text-sm text-muted-foreground">
                  {formData.description.length}/500 characters
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Evidence Photos (Optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload up to 5 photos to support your report. Maximum 10MB per
                  image.
                </p>

                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                    disabled={selectedImages.length >= 5}
                  >
                    <Upload className="h-4 w-4" />
                    Choose Images
                  </Button>

                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedImages.length}/5 images selected
                  </p>
                </div>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                          {(selectedImages[index].size / (1024 * 1024)).toFixed(
                            1,
                          )}
                          MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 skyeye-gradient"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Info */}
        <Card className="mt-6 border-accent/20 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-accent/10 p-2 rounded-full mt-1">
                <Camera className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">📸 Photo Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                  <li>• Capture multiple angles of the encroachment</li>
                  <li>• Include surrounding landmarks for context</li>
                  <li>• Ensure photos are clear and well-lit</li>
                  <li>• Show the full extent of the unauthorized activity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
