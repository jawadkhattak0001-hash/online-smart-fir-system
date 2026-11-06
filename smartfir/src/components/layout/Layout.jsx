  // src/components/layout/Layout.jsx
  import { useState } from "react";
  import Sidebar from "./Sidebar";
  import Navbar from "./Navbar";

  function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };

    return (
      <div className="flex h-screen bg-[#636d79]">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onToggleSidebar={toggleSidebar} />
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-[#f2f2f2] rounded-bl-[30px]">
            <div className="p-4 sm:p-6">
              {children}
            </div>

          </main>
        </div>
      </div>
    );
  }

  export default Layout;