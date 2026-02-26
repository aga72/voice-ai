import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import DiscoveryPage from "./pages/DiscoveryPage";
import EvaluatePage from "./pages/EvaluatePage";
import EvaluationResultsPage from "./pages/EvaluationResultsPage";
import PreviousSearchesPage from "./pages/PreviousSearchesPage";
import PreviousEvaluationsPage from "./pages/PreviousEvaluationsPage";
import CriteriaTemplatesPage from "./pages/CriteriaTemplatesPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/",                                  element: <DiscoveryPage /> },
      { path: "/evaluate",                          element: <EvaluatePage /> },
      { path: "/evaluations/:evaluationId/results", element: <EvaluationResultsPage /> },
      { path: "/searches",                          element: <PreviousSearchesPage /> },
      { path: "/evaluations",                       element: <PreviousEvaluationsPage /> },
      { path: "/criteria-templates",                element: <CriteriaTemplatesPage /> },
    ],
  },
]);
