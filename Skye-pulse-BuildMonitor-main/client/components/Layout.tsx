import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Eye,
  Shield,
  FileText,
  MapPin,
  LogOut,
  Menu,
  X,
  Bell,
  BellDot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { branding } from "@/config/branding";
import { alertsAPI } from "@/services/api";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  // Authentication check
  const isAuthenticated = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole"); // 'admin' or 'citizen'

  // Fetch unread alerts count for admins
  useEffect(() => {
    if (isAuthenticated && userRole === "admin") {
      const fetchAlertsCount = async () => {
        try {
          const count = await alertsAPI.getUnreadCount();
          setUnreadAlerts(count);
        } catch (error) {
          console.error("Failed to fetch alerts count:", error);
          // Don't set mock data, just show 0
          setUnreadAlerts(0);
        }
      };

      fetchAlertsCount();

      // Poll for alerts every 30 seconds
      const interval = setInterval(fetchAlertsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Shield,
      adminOnly: true,
    },
    {
      name: "Report Issue",
      href: "/report",
      icon: FileText,
      adminOnly: false,
    },
    {
      name: "Encroachments",
      href: "/encroachments",
      icon: MapPin,
      adminOnly: false,
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || userRole === "admin",
  );

  if (!isAuthenticated && location.pathname !== "/login") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="relative">
                  <Eye className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold skyeye-gradient-text">
                    {branding.logo.text}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium leading-none">
                    {branding.logo.subtitle}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-4">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        location.pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* User Menu */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                {/* Alerts Bell for Admin */}
                {userRole === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/dashboard")}
                  >
                    {unreadAlerts > 0 ? (
                      <BellDot className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                    {unreadAlerts > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadAlerts > 9 ? "9+" : unreadAlerts}
                      </span>
                    )}
                  </Button>
                )}

                <span className="hidden md:block text-sm text-muted-foreground px-2 py-1 bg-muted rounded-md">
                  {userRole === "admin" ? "🛡️ Admin" : "👤 Citizen"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>

                {/* Mobile menu button */}
                <button
                  className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-border">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
