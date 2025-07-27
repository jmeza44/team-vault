import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Shield, Users, User, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Credentials", href: "/credentials", icon: Shield },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 relative bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Team Vault</h1>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`
              }
            >
              <IconComponent className="mr-3 h-4 w-4" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
