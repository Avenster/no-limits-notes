import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("home", "component/index.tsx"),
  route("login", "./login/Login.tsx"),
  route("join", "./pages/join.tsx"),
  route("create", "./pages/create.tsx"),
route("group/:groupId/pages", "./pages/list.tsx"),
  route("group/:groupId/pages/:pageId", "./pages/note.tsx"),
  route("p/:slug", "./public-page/public-page.tsx"),
] satisfies RouteConfig;