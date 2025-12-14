import { lazy } from "react";
import { routes } from "./routes";

const NeoGraphs = lazy(() => import("../pages/NeoGraphs"));
const QtDb = lazy(() => import("../pages/QueryToDatabase"));
const TtS = lazy(() => import("../pages/TextToScheme"));



export const publicRoutes = [
  {
    title: "neo4j-graphs",
    path: routes.neographs,
    component: NeoGraphs,
  },
  {
    title: "main",
    path: routes.queryToDb,
    component: QtDb,
  },
  {
    title: "textToScheme",
    path: routes.textToScheme,
    component: TtS,
  },
];
