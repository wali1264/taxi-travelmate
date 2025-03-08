
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Clock, Menu, X, User, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  withBackButton?: boolean;
  showBottomNav?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  withBackButton = false,
  showBottomNav = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-background/70 backdrop-blur-md border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {withBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="tap-effect"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="sr-only">Go back</span>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium">{title || 'RideNow'}</h1>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="tap-effect">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[80vw] sm:max-w-sm">
              <SheetHeader className="pb-6">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 tap-effect"
                    >
                      <Home className="h-5 w-5" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/history">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 tap-effect"
                    >
                      <Clock className="h-5 w-5" />
                      Ride History
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 tap-effect"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-[calc(100vh-8rem)]">{children}</div>
      </main>

      {/* Bottom navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/70 backdrop-blur-md border-t border-border">
          <nav className="container flex h-16 items-center justify-around">
            <Link to="/" className="tap-effect">
              <div
                className={`flex flex-col items-center gap-1 ${
                  location.pathname === '/' ? 'text-primary' : 'text-foreground'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </div>
            </Link>
            <Link to="/history" className="tap-effect">
              <div
                className={`flex flex-col items-center gap-1 ${
                  location.pathname === '/history'
                    ? 'text-primary'
                    : 'text-foreground'
                }`}
              >
                <Clock className="h-5 w-5" />
                <span className="text-xs">History</span>
              </div>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
