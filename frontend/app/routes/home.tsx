import type { Route } from "./+types/home";
// import Logi  from "../welcome/welcome";
import HomePage from "../components/index";
export { loader } from "../components/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <HomePage />;
}
