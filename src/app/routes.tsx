import { createBrowserRouter } from "react-router";
import { LoginPage } from "../features/auth/login-page";
import { Dashboard } from "../features/dashboard/dashboard";
import { Redirect } from "../shared/components/redirect";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    element: <Redirect to="/" />,
  },
  {
    path: "*",
    element: <Redirect to="/" />,
  },
]);
