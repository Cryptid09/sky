import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Shield, FileText, MapPin, ArrowRight } from "lucide-react";
import { branding } from "@/config/branding";

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(userRole === "admin" ? "/dashboard" : "/report");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative skyeye-gradient p-4 rounded-full">
              <Eye className="h-16 w-16 text-white" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold skyeye-gradient-text mb-6">
            {branding.name}
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            {branding.tagline}
          </p>
          
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="text-lg px-8 py-6"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center p-6">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Report Issues</CardTitle>
              <CardDescription>
                Citizens can easily report illegal construction activities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Monitor Areas</CardTitle>
              <CardDescription>
                AI-powered satellite monitoring for encroachment detection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Admin Control</CardTitle>
              <CardDescription>
                Officials can manage reports and track progress
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
