import "@/assets/style/common.css";
import "@/assets/style/reset.css";
import { ConfigProvider } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
import { RecoilRoot } from "recoil";
import { Outlet } from "umi";

// @ts-ignore
import vl from "umi-hd/lib/vl";
vl(100, 375);

export default function Layout() {
  return (
    <RecoilRoot>
      <ConfigProvider locale={enUS}>
        <div>
          <Outlet />
        </div>
      </ConfigProvider>
    </RecoilRoot>
  );
}
