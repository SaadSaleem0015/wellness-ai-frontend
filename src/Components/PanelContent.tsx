import { useState, useEffect } from "react";
import { TbAlignLeft, TbX } from "react-icons/tb";
import { backendRequest } from "../Helpers/backendRequest";
import { Outlet, useNavigate } from "react-router-dom";

export interface PanelContentProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PanelContent({
  sidebarCollapsed,
  setSidebarCollapsed,
}: PanelContentProps) {
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleUser = async () => {
    try {
      const response = await backendRequest("GET", "/validate-token");

      const username = response?.data?.name || response?.data?.username || "";
      if (username) {
        setUserName(username);
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout(); // Token invalid → go to login
    }
  };

  useEffect(() => {
    handleUser();
  }, []);

  return (
      <div
        className="flex-grow bg-slate-100 px-2 sm:px-4 md:px-8 pb-4 sm:pb-8 sm:pt-4 overflow-auto"
        style={{
          overflowY: "scroll",
          scrollbarWidth: "thin",
          msOverflowStyle: "none",
        }}
      >
        {/* 🔝 Top Bar */}
        <div className="flex items-center justify-between w-full gap-2 mb-4">
          {/* Sidebar Toggle */}
          <div className="lg:hidden">
            <button
              className={`cursor-pointer p-1 ${
                sidebarCollapsed ? "fixed left-56 z-50" : ""
              } left-0 top-1 transition-all`}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              {sidebarCollapsed ? (
                <TbX className="text-red-500 text-xl" />
              ) : (
                <TbAlignLeft className="text-xl" />
              )}
            </button>
          </div>

          {/* User Info + Logout */}
          <div className="flex items-center gap-4 ml-auto">
            {userName && (
              <span className="text-gray-700 font-semibold text-sm sm:text-base">
                👤 {userName}
              </span>
            )}
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <Outlet />
      </div>

  );
}
