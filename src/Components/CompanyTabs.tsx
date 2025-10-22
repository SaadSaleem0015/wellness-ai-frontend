import React from 'react';
import { FiUsers, FiUser, FiPhone, FiActivity, FiBarChart2 } from 'react-icons/fi';

interface CompanyTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CompanyTabs: React.FC<CompanyTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'users', label: 'Users', icon: <FiUsers size={16} /> },
    { id: 'assistants', label: 'Assistants', icon: <FiUser size={16} /> },
    { id: 'call_logs', label: 'Call Logs', icon: <FiActivity size={16} /> },
    { id: 'phone_numbers', label: 'Phone Numbers', icon: <FiPhone size={16} /> },
    { id: 'pl_report', label: 'P&L Report', icon: <FiBarChart2 size={16} /> },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex overflow-x-auto no-scrollbar">
        <div className="flex mx-auto w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2 relative transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t"></span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CompanyTabs;