import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Search,
  ChevronDown,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Menu,
  Clock,
} from "lucide-react";

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { data } = useData();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isDSP = role === 'dsp';
  const isSHO = role === 'sho';
  const isSI = role === 'si';

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    ...data.alerts.slice(0, 2).map(alert => ({
      id: `alert-${alert.id}`,
      type: "alert",
      message: `${alert.suspectName || 'Unknown'} detected at ${alert.location || 'unknown location'}`,
      time: new Date(alert.timestamp).toLocaleTimeString(),
      unread: alert.status === 'new'
    })),
    ...data.firs.slice(0, 2).map(fir => ({
      id: `fir-${fir.id}`,
      type: "fir",
      message: `${fir.firNumber || fir.id} - ${fir.status}`,
      time: new Date(fir.createdAt).toLocaleDateString(),
      unread: fir.status === 'pending'
    })),
  ];

  const unreadCount = notifications.filter(n => n.unread).length;
  const pendingFIRsCount = data.firs?.filter(f => f.status === 'pending').length || 0;
  const newAlertsCount = data.alerts?.filter(a => a.status === 'new').length || 0;

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const markAllAsRead = () => {
    setShowNotifications(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-[#f2f2f2] px-4 sm:px-6 py-4 rounded-tl-[30px]">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden hover:bg-gray-100 rounded-xl"
          >
            <Menu size={20} />
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isSuperAdmin ? 'Super Admin Panel' :
                 isDSP ? 'DSP Dashboard' :
                 isSHO ? 'SHO Dashboard' :
                 isSI ? 'SI Dashboard' :
                 'Officer Dashboard'}
              </h1>
              <div className="flex items-center gap-2 sm:gap-4 mt-1">
                <span className="text-sm text-gray-500">
                  {user?.stationName || 'Gulberg Station'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-2 sm:gap-4">
              {(isSuperAdmin || isDSP || isSHO) && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
                    <span className="text-xs text-blue-700 font-medium">Officers</span>
                    <span className="text-sm font-bold text-blue-800">
                      {data.officers?.filter(o => o.status === 'active').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
                    <span className="text-xs text-orange-700 font-medium">FIRs</span>
                    <span className="text-sm font-bold text-orange-800">{pendingFIRsCount}</span>
                  </div>
                </>
              )}
              {isSI && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
                  <span className="text-xs text-blue-700 font-medium">My Cases</span>
                  <span className="text-sm font-bold text-blue-800">
                    {data.firs?.filter(f => f.assignedOfficer === user?.id).length || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Current Time */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(currentTime)}
            </span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-48 lg:w-64 pl-10 bg-white border-0 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all rounded-xl"
            />
          </form>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:bg-gray-100 rounded-xl"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse border-0"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 sm:w-80 bg-white rounded-2xl shadow-xl z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Mark all read
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === 'alert' ? 'bg-red-500' :
                            notification.type === 'fir' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock size={12} />
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3">
                  <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
                    View all
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gray-100 rounded-xl"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Officer'}</p>
                <p className="text-xs text-gray-500">
                  {user?.badgeNumber || 'PK-12345'}
                </p>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </Button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 sm:w-64 bg-white rounded-2xl shadow-xl z-50">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">{user?.name || 'Officer'}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.stationName || 'Police Station'}</p>
                      <Badge variant="secondary" className="mt-1 capitalize bg-gray-100 text-gray-700 text-xs">
                        {user?.role?.replace('_', ' ') || 'Officer'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Button variant="ghost" className="w-full justify-start hover:bg-gray-50 rounded-lg text-sm">
                    <User size={16} className="mr-2" />
                    My Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-gray-50 rounded-lg text-sm">
                    <MessageSquare size={16} className="mr-2" />
                    Messages
                  </Button>
                  {isSuperAdmin && (
                    <Button variant="ghost" className="w-full justify-start hover:bg-gray-50 rounded-lg text-sm">
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Button>
                  )}
                </div>

                <div className="p-2">
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        ></div>
      )}
    </header>
  );
}

export default Navbar;