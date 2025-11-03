import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Login } from "./Pages/Login";
import "./index.css";
import { Dashboard } from "./Pages/Dashboard";
import { PanelLayout } from "./Components/PanelLayout";
import { Leads } from "./Pages/Leads";
import Assistant from "./Pages/Assistant";
import GetNumbers from "./Pages/GetNumbers";
import { LoginChecker } from "./Components/LoginChecker";
import { Files } from "./Pages/Files";
import CreateAssitant from "./Pages/CreateAssistant";
import { Documents } from "./Pages/Documents";

import UsageReport from "./Pages/UsageReport";
// import BillingReport from "./Pages/BillingReport";
import { ViewLeads } from "./Pages/ViewLeads";
import ReportDashboard from "./Pages/Reportdashboard";
import {
  isUserRole,
} from "./Helpers/roleChecker";
import { ViewDocuments } from "./Components/ViewDocuments";
// import { States } from "./Pages/States";
import NotFoundPage from "./Components/NotFound";
import Appointments from "./Pages/Appointments";
import ErrorBoundary from "./Components/ErrorBoundary";
import GhlLeads from "./Pages/GhlLeads";
import Schedule from "./Pages/Schedule";
import { ContentManagement } from "./Pages/ContentManagement";
import { EventsAvailability } from "./Pages/EventsAvailability";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
  },

  {
    path: "*",
    element: <ErrorBoundary><NotFoundPage /></ErrorBoundary>
  },


  {
    path: "/login",
    element: (
      <LoginChecker allowedUser="not-logged-in">
        <ErrorBoundary><Login /></ErrorBoundary>
      </LoginChecker>
    ),
  },
  



  {
    path: "/",
    element: (
      <LoginChecker allowedUser="logged-in">
          <ErrorBoundary><PanelLayout /></ErrorBoundary>
      </LoginChecker>
    ),
    children: [
      {
        path: "dashboard",
        element: <ErrorBoundary><Dashboard /></ErrorBoundary>,
      },
      {
        path: "files",
        element: <ErrorBoundary><Files /></ErrorBoundary>,
      },
      {
        path: "view-leads",
        element: <ErrorBoundary><ViewLeads /></ErrorBoundary>,
      },
      {
        path: "leads",
        element: <ErrorBoundary><Leads /></ErrorBoundary>,
      },
      {
        path: "ghl-leads",
        element: <ErrorBoundary><GhlLeads /></ErrorBoundary>,
      },
 


      ...(!isUserRole()
        ? [
          {
            path: "Getnumbers",
            element: <ErrorBoundary><GetNumbers /></ErrorBoundary>,
          },
        ]
        : []),
      {
        path: "documents",
        element: <ErrorBoundary><ViewDocuments /></ErrorBoundary>,
      },
      {
        path: "documents/upload",
        element: <ErrorBoundary><Documents /></ErrorBoundary>,
      },
      {
        path: "assistant/createassistant",
        element: <ErrorBoundary><CreateAssitant /></ErrorBoundary>,
      },
      {
        path: "assistant",
        element: <ErrorBoundary><Assistant /></ErrorBoundary>,
      },
      {
        path: "appointments",
        element: <ErrorBoundary><Appointments /></ErrorBoundary>,
      },
      {
        path: "schedule",
        element: <ErrorBoundary><Schedule /></ErrorBoundary>,
      },
      {
        path: "report-dashboard",
        element: <ErrorBoundary><ReportDashboard /></ErrorBoundary>,
      },
      {
        path: "content-management",
        element: <ErrorBoundary><ContentManagement /></ErrorBoundary>,
      },
      {
        path: "events-availability",
        element: <ErrorBoundary><EventsAvailability /></ErrorBoundary>,
      },
      {
        path: "call-logs",
        element: <ErrorBoundary><UsageReport /></ErrorBoundary>,
      },
      // ...(!isUserRole()
      //   ? [
      //     {
      //       path: "billing-report",
      //       element: <ErrorBoundary><BillingReport /></ErrorBoundary>,
      //     },
      //   ]
      //   : []),




    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);