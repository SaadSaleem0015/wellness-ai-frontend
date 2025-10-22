import { NavLink, Link } from "react-router-dom";
import { ReactNode } from "react";
import {
  TbDashboard,
  TbPhoneCalling,
  // TbReportMoney,
  TbRobot,
  TbCalendar,
} from "react-icons/tb";
import { FaFileAlt } from "react-icons/fa";
import {
  MdCall,
} from "react-icons/md";
// import { BiDollar } from "react-icons/bi";
import { LuFileBadge } from "react-icons/lu";

const SidebarItem = ({
  to,
  children,
  icon,
}: {
  to: string;
  children: ReactNode;
  icon: ReactNode;
}) => {
  const byPassActive = window.location.pathname == "/leads" && to == "/files";
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `p-3 flex items-center gap-3 rounded-lg transition-colors ${
          isActive || byPassActive 
            ? "text-white bg-primary font-medium" 
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
};

export function Sidebar({ sidebarCollapsed }: { sidebarCollapsed: boolean, setSidebarCollapsed: (v: boolean) => void }) {
  const role = localStorage.getItem("role");



  return (
    <div
      className={`w-64 min-w-64 max-w-64 p-6 h-full overflow-hidden absolute z-50 bg-white border-r border-gray-200 ${
        sidebarCollapsed ? "" : "translate-x-[-100%]"
      } absolute lg:translate-x-[0%] transition-transform lg:relative lg:block`}
      style={{
        overflowY: "scroll",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <Link to="/" className="block mb-8 text-primary max-w-full text-2xl font-bold">
        WellNess
      </Link>
      
      <div className="flex flex-col gap-2">
        <SidebarItem to="/dashboard" icon={<TbDashboard size={20} />}>
          Dashboard
        </SidebarItem>

        {role !== "user" && (
          <SidebarItem to="/getnumbers" icon={<MdCall size={20} />}>
            Purchase Number
          </SidebarItem>
        )}

        <SidebarItem to="/assistant" icon={<TbRobot size={20} />}>
          Assistant
        </SidebarItem>

        <SidebarItem to="/appointments" icon={<TbCalendar size={20} />}>
          Appointments
        </SidebarItem>
        <SidebarItem to="/schedule" icon={<TbCalendar size={20} />}>
          Schedule
        </SidebarItem>

        <div className="px-3 py-2 text-gray-500 font-medium flex items-center gap-3">
          <LuFileBadge size={20} />
          Leads
        </div>
        <div className="ml-6 flex flex-col gap-2">
          <SidebarItem to="/view-leads" icon={<span className="w-2 h-2 bg-gray-400 rounded-full inline-block" />}> 
            Custom Leads
          </SidebarItem>
          <SidebarItem to="/ghl-leads" icon={<span className="w-2 h-2 bg-gray-400 rounded-full inline-block" />}> 
            GHL Leads
          </SidebarItem>
        </div>

        <SidebarItem to="/documents" icon={<FaFileAlt size={20} />}>
          Knowledge Base
        </SidebarItem>

        <SidebarItem to="/call-logs" icon={<TbPhoneCalling size={20} />}>
          Call Logs
        </SidebarItem>

        {/* {role !== "user" && (
          <SidebarItem to="/billing-report" icon={<BiDollar size={20} />}>
            Billing Report
          </SidebarItem>
        )} */}

     

        {/* <SidebarItem to="/usage-report" icon={<TbReportMoney size={20} />}>
          Usage Report
        </SidebarItem> */}
      </div>
    </div>
  );
}