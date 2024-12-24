import '@/assets/style/common.css';
import '@/assets/style/reset.css';
import { envMap, metaInit } from '@goshgame/fe_utils';
import { useMount } from 'ahooks';
import { ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import { RecoilRoot } from 'recoil';
import { Outlet } from 'umi';
import VConsole from 'vconsole';

// @ts-ignore
import vl from 'umi-hd/lib/vl';
vl(100, 375);

if (envMap.env !== 'prod') {
  new VConsole();
}

export default function Layout() {
  useMount(() => {
    metaInit();
  });
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
