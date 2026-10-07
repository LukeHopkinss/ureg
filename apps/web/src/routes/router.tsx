import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "../components/Layout.js";
import { AutomationDetailPage } from "../pages/AutomationDetailPage.js";
import { AutomationsPage } from "../pages/AutomationsPage.js";
import { SettingsPage } from "../pages/SettingsPage.js";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/automations" replace /> },
      { path: "automations", element: <AutomationsPage /> },
      { path: "automations/:id", element: <AutomationDetailPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
