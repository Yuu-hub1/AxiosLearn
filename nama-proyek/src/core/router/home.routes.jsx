
import HomeLayout from "../../views/layouts/home";
import Features from "../../views/pages/feature";
import HomePage from "../../views/pages/home";

export const homeRoutes = {
  path: "/",
  element: <HomeLayout/> ,
  children: [
    { index: true, element: <HomePage/> },
    { path:"features", element: <Features/> },
  ],
};
