import { Skeleton } from '@affine/component';
import { useAppSettingHelper } from '@affine/core/components/hooks/affine/use-app-setting-helper';
import { NavigateContext } from '@affine/core/components/hooks/use-navigate-helper';
import { WorkspaceNavigator } from '@affine/core/components/workspace-selector';
import {
  useLiveData,
  useService,
  useServiceOptional,
} from '@toeverything/infra';
import clsx from 'clsx';
import type { PropsWithChildren, ReactElement } from 'react';
import { useCallback, useContext, useEffect, useMemo } from 'react';

import { WorkspaceService } from '../../workspace';
import { AppSidebarService } from '../services/app-sidebar';
import * as styles from './fallback.css';
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

export function FallbackHeader() {
  return (
    <div className={styles.fallbackHeader}>
      <FallbackHeaderSkeleton />
    </div>
  );
}

export function FallbackHeaderWithWorkspaceNavigator() {
  const navigate = useContext(NavigateContext);

  const currentWorkspace = useServiceOptional(WorkspaceService);
  return (
    <div className={styles.fallbackHeader}>
      {currentWorkspace && navigate ? (
        <WorkspaceNavigator showSyncStatus showEnableCloudButton dense />
      ) : (
        <FallbackHeaderSkeleton />
      )}
    </div>
  );
}

export function FallbackHeaderSkeleton() {
  return (
    <>
      <Skeleton variant="rectangular" width={32} height={32} />
      <Skeleton variant="rectangular" width={150} height={32} flex={1} />
      <Skeleton variant="circular" width={25} height={25} />
    </>
  );
}

const randomWidth = () => {
  return Math.floor(Math.random() * 200) + 100;
};

const RandomBar = ({ className }: { className?: string }) => {
  const width = useMemo(() => randomWidth(), []);
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={16}
      className={className}
    />
  );
};

const RandomBars = ({ count, header }: { count: number; header?: boolean }) => {
  return (
    <div className={styles.fallbackGroupItems}>
      {header ? (
        <Skeleton
          className={styles.fallbackItemHeader}
          variant="rectangular"
          width={50}
          height={16}
        />
      ) : null}
      {Array.from({ length: count }).map((_, index) => (
        <RandomBar key={index} />
      ))}
    </div>
  );
};

const FallbackBody = () => {
  return (
    <div className={styles.fallbackBody}>
      <RandomBars count={3} />
      <RandomBars count={4} header />
      <RandomBars count={4} header />
      <RandomBars count={3} header />
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
          <div className={styles.fallback}>
            <FallbackHeaderWithWorkspaceNavigator />
            <FallbackBody />
          </div>
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
          <div className={styles.fallback}>
            <FallbackHeader />
            <FallbackBody />
          </div>
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
