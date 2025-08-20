import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye as EyeIcon, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { branding } from "@/config/branding";
import { authAPI, LoginRequest } from "@/services/api";

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
    role: "citizen" as "admin" | "citizen",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      // Store authentication data
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userRole", response.user.role);

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
      });

      // Redirect based on role
      if (response.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/report");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md farmer-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative skyeye-gradient p-3 rounded-full">
              <EyeIcon className="h-8 w-8 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold skyeye-gradient-text">
            {branding.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {branding.tagline}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Login as</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.role === "admin" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setFormData({ ...formData, role: "admin" })}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
                <Button
                  type="button"
                  variant={formData.role === "citizen" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setFormData({ ...formData, role: "citizen" })}
                >
                  Citizen
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground mb-1">
                  🌾 Demo Access
                </p>
                <p>Use any email/password to explore the system</p>
                <p className="text-xs mt-1">
                  Try: admin@skyeye.com / farmer@skyeye.com
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
