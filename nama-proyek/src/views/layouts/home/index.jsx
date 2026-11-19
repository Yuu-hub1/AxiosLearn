import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <>
      <div className="relative h-auto overflow-x-hidden z-10">
          <Outlet />
      </div>
    </>
  );
}

export default HomeLayout;
