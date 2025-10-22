import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Login } from "./Pages/Login";
import "./index.css";
import { ForgetPassword } from "./Pages/ForgetPassword";
import { Dashboard } from "./Pages/Dashboard";
import { PanelLayout } from "./Components/PanelLayout";
import { Leads } from "./Pages/Leads";
import Assistant from "./Pages/Assistant";
import GetNumbers from "./Pages/GetNumbers";
import { Profile } from "./Pages/Profile";
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
import BusinessSchedule from "./Pages/BusinessSchedule";
// import { States } from "./Pages/States";
import NotFoundPage from "./Components/NotFound";
import Appointment from "./Pages/Appointement";
import Appointments from "./Pages/Appointments";
import ErrorBoundary from "./Components/ErrorBoundary";
import CannotAccessPage from "./Components/CantAccess";
import GhlLeads from "./Pages/GhlLeads";
import Schedule from "./Pages/Schedule";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: 'can-not-access',
    element: <ErrorBoundary><CannotAccessPage /></ErrorBoundary>
  },
  {
    path: "*",
    element: <ErrorBoundary><NotFoundPage /></ErrorBoundary>
  },
  // {
  //   path: "/appointment-schedulde",
  //   element: <ErrorBoundary><AppointmentSuccess /></ErrorBoundary>,
  // },
  {
    path: "/Appointment",
    element: <ErrorBoundary><Appointment /></ErrorBoundary>,
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
    path: "/forget-password",
    element: (
      <LoginChecker allowedUser="not-logged-in">
        <ErrorBoundary><ForgetPassword /></ErrorBoundary>
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
      {
        path: "business-schedule",
        element: <ErrorBoundary><BusinessSchedule /></ErrorBoundary>,
      },


      {
        path: "profile",
        element: <ErrorBoundary><Profile /></ErrorBoundary>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);