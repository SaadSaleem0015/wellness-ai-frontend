import { useState, useEffect } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { TbUser, TbFiles, TbDatabase, TbRobot, TbTrendingUp } from "react-icons/tb";
import { Link } from "react-router-dom";

interface Statistics {
  leads: number;
  files: number;
  assistants: number;
  knowledge_bases: number;
}

export function Dashboard() {
  const [statistics, setStatistics] = useState<Statistics>({
    leads: 0,
    files: 0,
    assistants: 0,
    knowledge_bases: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await backendRequest<{ success: boolean; totals: { leads: number; knowledge_bases: number; assistants: number; files: number } }>(
          "GET",
          "/dashboard"
        );
        if (res && (res as any).success && (res as any).totals) {
          const { totals } = res as any;
          setStatistics({
            leads: totals.leads || 0,
            files: totals.files || 0,
            assistants: totals.assistants || 0,
            knowledge_bases: totals.knowledge_bases || 0,
          });
        }
      } catch (e) {
        // leave defaults on error
      }
    };
    fetchDashboard();
  }, []);

  const StatCard = ({ 
    to, 
    icon: Icon, 
    value, 
    label, 
    gradient 
  }: { 
    to: string; 
    icon: React.ElementType; 
    value: number; 
    label: string; 
    gradient: string; 
  }) => (
    <Link
      to={to}
      className="group relative bg-white rounded-xl p-6 w-full cursor-pointer max-w-full 
                 shadow-lg hover:shadow-xl transition-all duration-300 ease-out
                 border border-gray-100 hover:border-gray-200 overflow-hidden"
    >
      {/* Background gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`} />
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
      
      <div className="relative z-10 flex justify-between items-center">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${gradient} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>
        
        <div className="text-end">
          <div className="flex items-center justify-end gap-2">
            <div className="font-bold text-2xl text-gray-800 group-hover:text-gray-900 transition-colors">
              {value.toLocaleString()}
            </div>
            <TbTrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-gray-600 text-sm font-medium mt-1 group-hover:text-gray-700 transition-colors">
            {label}
          </div>
        </div>
      </div>
      
      {/* Subtle progress bar */}
      <div className="relative mt-4 w-full bg-gray-100 rounded-full h-1">
        <div 
          className={`absolute top-0 left-0 h-1 rounded-full ${gradient} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min((value / 2000) * 100, 100)}%` }}
        />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          to="/leads"
          icon={TbUser}
          value={statistics.leads}
          label="Total Leads"
          gradient="from-blue-500 to-cyan-500"
        />

        <StatCard
          to="/files"
          icon={TbFiles}
          value={statistics.files}
          label="Files Processed"
          gradient="from-green-500 to-emerald-500"
        />

        <StatCard
          to="/assistant"
          icon={TbRobot}
          value={statistics.assistants}
          label="AI Assistants"
          gradient="from-purple-500 to-pink-500"
        />

        <StatCard
          to="/documents"
          icon={TbDatabase}
          value={statistics.knowledge_bases}
          label="Knowledge Base"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Additional Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/leads"
              className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
            >
              <TbUser className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Leads</span>
            </Link>
            <Link
              to="/assistant"
              className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
            >
              <TbRobot className="w-5 h-5 text-purple-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">AI Assistants</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}