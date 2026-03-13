import { createBrowserRouter } from "react-router";
import { LoginPage } from "../features/auth/login-page";
import { Dashboard } from "../features/dashboard/dashboard";
import { Redirect } from "../shared/components/redirect";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/login",
    element: <Redirect to="/" />,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "*",
    element: <Redirect to="/" />,
  },
]);
