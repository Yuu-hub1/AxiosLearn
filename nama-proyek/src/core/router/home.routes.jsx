
import HomeLayout from "../../views/layouts/home";
import HomePage from "../../views/pages/home";

export const homeRoutes = {
  path: "/",
  element: <HomeLayout/> ,
  children: [
    { index: true, element: <HomePage/> },
  ],
};
