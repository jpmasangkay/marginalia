import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/login-page";
import { Dashboard } from "./pages/dashboard";
import { Redirect } from "./components/redirect";

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
