import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import DiscoveryPage from "./pages/DiscoveryPage";
import EvaluatePage from "./pages/EvaluatePage";
import ScansPage from "./pages/ScansPage";
import CriteriaTemplatesPage from "./pages/CriteriaTemplatesPage";

export const router = createBrowserRouter([
  {
    // Layout is the shared wrapper — Header lives here
    // All children pages render inside it via <Outlet />
    element: <Layout />,
    children: [
      { path: "/",          element: <DiscoveryPage /> },
      { path: "/evaluate",  element: <EvaluatePage /> },
      { path: "/scans",     element: <ScansPage /> },
      { path: "/criteria",  element: <CriteriaTemplatesPage /> },
    ],
  },
]);
