import { Sidebar } from "./Sidebar";
import { PanelContent } from "./PanelContent";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function PanelLayout() {
    const navigate = useNavigate()

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    useEffect(()=>{
        const user_role = localStorage.getItem('role')
        if (user_role =='admin'){
            navigate('/admin/dashboard')
        }
    })
    return (
        <div className="flex h-screen"> 
            <Sidebar
                sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
            <PanelContent
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed} />
        </div>
    );
}