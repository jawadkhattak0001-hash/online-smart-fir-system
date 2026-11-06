import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  Camera,
  Bell,
  BarChart3,
  Settings,
  Shield,
  UserCheck,
  Search,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function Sidebar({ onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data } = useData();

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isDSP = role === 'dsp';
  const isSHO = role === 'sho';
  const isSI = role === 'si';

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Role-based menu items
  const getMenuItems = () => {
    const baseMenu = [
      { 
        name: "Dashboard", 
        path: "/", 
        icon: LayoutDashboard, 
        roles: ['super_admin', 'dsp', 'sho', 'si'],
        badge: null
      },
      { 
        name: "FIR Management", 
        path: "/firs", 
        icon: FileText, 
        roles: ['super_admin', 'dsp', 'sho', 'si'],
        badge: data.firs?.filter(f => f.status === 'pending').length || 0
      },
      { 
        name: "Suspect Alerts", 
        path: "/alerts", 
        icon: Bell, 
        roles: ['super_admin', 'dsp', 'sho', 'si'],
        badge: data.alerts?.filter(a => a.status === 'new').length || 0
      },
      { 
        name: "Suspect Database", 
        path: "/suspect", 
        icon: Search, 
        roles: ['super_admin', 'dsp', 'sho', 'si'],
        badge: null
      },
    ];

    const adminMenu = [
      { 
        name: "Manage Officers", 
        path: "/officers", 
        icon: Users, 
        roles: ['sho'],
        badge: data.officers?.length || 0
      },
      { 
        name: "Camera Management", 
        path: "/cameras", 
        icon: Camera, 
        roles: ['super_admin', 'sho'],
        badge: data.cameras?.filter(c => c.status === 'offline').length || 0
      },
    ];

    const dspMenu = [
      { 
        name: "DSP Dashboard", 
        path: "/dsp", 
        icon: Shield, 
        roles: ['dsp'],
        badge: null
      },
    ];

    const siMenu = [
      { 
        name: "SI Dashboard", 
        path: "/si-dashboard", 
        icon: UserCheck, 
        roles: ['si'],
        badge: null
      }
    ];

    const reportsMenu = [
      { 
        name: "Reports & Analytics", 
        path: "/reports", 
        icon: BarChart3, 
        roles: ['super_admin', 'dsp', 'sho'],
        badge: null
      },
    ];

    const settingsMenu = [
      { 
        name: "Settings", 
        path: "/settings", 
        icon: Settings, 
        roles: ['super_admin'],
        badge: null
      },
    ];

    // Combine all menus
    const allMenuItems = [
      ...baseMenu,
      ...adminMenu,
      ...dspMenu,
      ...reportsMenu,
      ...settingsMenu,
      ...siMenu
    ];

    // Filter by role
    return allMenuItems.filter(item => 
      item.roles.includes(role)
    );
  };

  const handleLogout = () => {
    logout();
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`
      bg-[#636d79] text-white h-screen flex flex-col
      transition-all duration-300
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Header */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SmartFIR</h1>
              <p className="text-blue-200 text-xs">{user?.stationName}</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
        )}
        
        {/* Buttons */}
        <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : 'flex'}`}>
          {/* Collapse button for desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="text-white hover:bg-white/20 rounded-xl hidden lg:flex"
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </Button>
          
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-xl lg:hidden"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="text-white hover:bg-white/20 rounded-xl hidden lg:flex"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </Button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {getMenuItems().map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center transition-all duration-200 group
                    ${isCollapsed ? 'justify-center p-3 rounded-xl' : 'justify-between p-3 rounded-xl'}
                    ${isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                    }
                  `}
                  title={isCollapsed ? item.name : ""}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                  </div>
                  
                  {/* Badge for counts - only show when not collapsed */}
                  {!isCollapsed && item.badge !== null && item.badge > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500/30 text-blue-200'
                    }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-3">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user?.name}</p>
                <p className="text-blue-200 text-xs truncate">{user?.badgeNumber}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all rounded-xl text-sm"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials()}
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all rounded-xl"
              title="Logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;