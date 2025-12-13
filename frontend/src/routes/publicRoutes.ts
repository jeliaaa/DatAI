import { lazy } from "react";
import { routes } from "./routes";

const Test = lazy(() => import("../Test"));
const QtDb = lazy(() => import("../pages/QueryToDatabase"));
const TtS = lazy(() => import("../pages/TextToScheme"));



export const publicRoutes = [
  {
    title: "main",
    path: routes.test,
    component: Test,
  },
  {
    title: "queryToDb",
    path: routes.queryToDb,
    component: QtDb,
  },
  {
    title: "textToScheme",
    path: routes.textToScheme,
    component: TtS,
  },
];
