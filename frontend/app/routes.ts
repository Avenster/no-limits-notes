import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("home", "component/index.tsx"),
  route("login", "./login/login.tsx"),
] satisfies RouteConfig;