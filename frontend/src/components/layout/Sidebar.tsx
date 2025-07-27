import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/contexts/MobileContext";
import { BarChart3, Shield, Users, User } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Credentials", href: "/credentials", icon: Shield },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Profile", href: "/profile", icon: User },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isMobile, closeSidebar } = useMobile();

  const handleNavLinkClick = () => {
    // Close sidebar on mobile when navigating
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Team Vault</h1>
      </div>

      <nav className="px-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`
              }
            >
              <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          <button
            onClick={logout}
            className="btn btn-outline mt-3 w-full text-xs py-2 px-3 rounded-md border transition-colors min-h-[36px]"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
