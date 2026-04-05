import { Skeleton } from '@affine/component';
import { useAppSettingHelper } from '@affine/core/components/hooks/affine/use-app-setting-helper';
import {
  useLiveData,
  useService,
} from '@toeverything/infra';
import clsx from 'clsx';
import type { PropsWithChildren, ReactElement } from 'react';
import { useCallback, useEffect } from 'react';

import { AppSidebarService } from '../services/app-sidebar';
import {
  hoverNavWrapperStyle,
  navBodyStyle,
  navHeaderStyle,
  navStyle,
  navWrapperStyle,
  sidebarFloatMaskStyle,
  sidebarToggleHandleStyle,
} from './index.css';
import { SidebarHeader } from './sidebar-header';

export type History = {
  stack: string[];
  current: number;
};

const SIDEBAR_WIDTH = 80;
const isMacosDesktop = BUILD_CONFIG.isElectron && environment.isMacOs;

export function AppSidebar({ children }: PropsWithChildren) {
  const { appSettings } = useAppSettingHelper();

  const clientBorder = appSettings.clientBorder;

  const appSidebarService = useService(AppSidebarService).sidebar;

  const open = useLiveData(appSidebarService.open$);
  const smallScreenMode = useLiveData(appSidebarService.smallScreenMode$);
  const hovering = useLiveData(appSidebarService.hovering$) && open !== true;

  const sidebarState = smallScreenMode
    ? open
      ? 'floating-with-mask'
      : 'close'
    : open
      ? 'open'
      : hovering
        ? 'floating'
        : 'close';

  const hasRightBorder = !BUILD_CONFIG.isElectron && !clientBorder;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      appSidebarService.setOpen(open);
    },
    [appSidebarService]
  );

  const handleClose = useCallback(() => {
    appSidebarService.setOpen(false);
  }, [appSidebarService]);

  const handleToggleSidebar = useCallback(() => {
    handleOpenChange(!open);
  }, [handleOpenChange, open]);

  useEffect(() => {
    if (sidebarState !== 'floating') {
      return;
    }
    const onMouseMove = (e: MouseEvent) => {
      const menuElement = document.querySelector(
        'body > [data-radix-popper-content-wrapper] > [data-radix-menu-content]'
      );

      if (menuElement) {
        return;
      }

      if (e.clientX > SIDEBAR_WIDTH + 20) {
        appSidebarService.setHovering(false);
      }
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [appSidebarService, sidebarState]);

  return (
    <>
      <div
        className={clsx(navWrapperStyle, {
          [hoverNavWrapperStyle]: sidebarState === 'floating',
        })}
        data-transparent
        data-open={sidebarState !== 'close'}
        data-has-border={hasRightBorder}
        data-testid="app-sidebar-wrapper"
        data-is-macos-electron={isMacosDesktop}
        data-client-border={clientBorder}
        data-is-electron={BUILD_CONFIG.isElectron}
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
        }}
      >
        <nav className={navStyle} data-testid="app-sidebar">
          {!BUILD_CONFIG.isElectron && sidebarState !== 'floating' && (
            <SidebarHeader />
          )}
          <div className={navBodyStyle} data-testid="sliderBar-inner">
            {children}
          </div>
        </nav>
      </div>
      <div
        className={sidebarToggleHandleStyle}
        onClick={handleToggleSidebar}
        data-open={sidebarState !== 'close'}
      />
      <div
        data-testid="app-sidebar-float-mask"
        data-open={open}
        data-is-floating={sidebarState === 'floating-with-mask'}
        className={sidebarFloatMaskStyle}
        onClick={handleClose}
      />
    </>
  );
}

const IconFallback = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 8px',
        gap: 8,
        height: '100%',
      }}
    >
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="circular" width={40} height={40} />
      <div style={{ width: 24, height: 1, background: 'rgba(0,0,0,0.1)', margin: '4px 0' }} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="circular" width={40} height={40} />
      <div style={{ width: 24, height: 1, background: 'rgba(0,0,0,0.1)', margin: '4px 0' }} />
      <Skeleton variant="circular" width={40} height={40} />
      <div style={{ flex: 1 }} />
      <Skeleton variant="circular" width={40} height={40} />
    </div>
  );
};

export const AppSidebarFallback = (): ReactElement | null => {
  const { appSettings } = useAppSettingHelper();
  const clientBorder = appSettings.clientBorder;

  return (
    <div
      style={{ width: SIDEBAR_WIDTH }}
      className={navWrapperStyle}
      data-has-border={!BUILD_CONFIG.isElectron && !clientBorder}
      data-open="true"
    >
      <nav className={navStyle}>
        {!BUILD_CONFIG.isElectron ? <div className={navHeaderStyle} /> : null}
        <div className={navBodyStyle}>
          <IconFallback />
        </div>
      </nav>
    </div>
  );
};

export const ShellAppSidebarFallback = () => {
  const { appSettings } = useAppSettingHelper();
  const clientBorder = appSettings.clientBorder;

  return (
    <div
      style={{ width: SIDEBAR_WIDTH }}
      className={navWrapperStyle}
      data-has-border={!BUILD_CONFIG.isElectron && !clientBorder}
      data-open="true"
    >
      <nav className={navStyle}>
        {!BUILD_CONFIG.isElectron ? <div className={navHeaderStyle} /> : null}
        <div className={navBodyStyle}>
          <IconFallback />
        </div>
      </nav>
    </div>
  );
};

export * from './add-page-button';
export * from './app-download-button';
export * from './app-updater-button';
export * from './category-divider';
export * from './index.css';
export * from './menu-item';
export * from './open-in-app-card';
export * from './quick-search-input';
export * from './sidebar-containers';
export * from './sidebar-header';
