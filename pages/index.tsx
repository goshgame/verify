import "@/assets/style/common.css";
import "@/assets/style/reset.css";
import { Outlet } from "umi";

export default function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
