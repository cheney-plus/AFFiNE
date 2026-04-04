import { Menu } from '@affine/component';
import { useNavigateHelper } from '@affine/core/components/hooks/use-navigate-helper';
import {
  AppSidebar,
  MenuItem,
  SidebarContainer,
} from '@affine/core/modules/app-sidebar/views';
import { ServerService } from '@affine/core/modules/cloud';
import { WorkspaceDialogService } from '@affine/core/modules/dialogs';
import { FeatureFlagService } from '@affine/core/modules/feature-flag';
import { CMDKQuickSearchService } from '@affine/core/modules/quicksearch/services/cmdk';
import type { Workspace } from '@affine/core/modules/workspace';
import { GlobalContextService } from '@affine/core/modules/global-context';
import { WorkspacesService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { track } from '@affine/track';
import type { Store } from '@blocksuite/affine/store';
import {
  AiOutlineIcon,
  AllDocsIcon,
  BulletedListIcon,
  CloudWorkspaceIcon,
  ImportIcon,
  LocalWorkspaceIcon,
  SearchIcon,
  SettingsIcon,
  TodayIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService, useServices } from '@toeverything/infra';
import type { ReactElement } from 'react';
import { memo, useCallback, useState } from 'react';

import {
  CollapsibleSection,
  NavigationPanelCollections,
  NavigationPanelFavorites,
  NavigationPanelMigrationFavorites,
  NavigationPanelOrganize,
  NavigationPanelTags,
} from '../../desktop/components/navigation-panel';
import { WorkbenchService } from '../../modules/workbench';
import { UserWithWorkspaceList } from '../workspace-selector/user-with-workspace-list';
import {
  divider,
  iconButton,
  iconButtonIcon,
  iconSidebarContainer,
  navigationMenuContent,
  spacer,
  workspaceButton,
} from './index.css';
import { InviteMembersButton } from './invite-members-button';
import { TemplateDocEntrance } from './template-doc-entrance';
import { TrashButton } from './trash-button';
import UserInfo from './user-info';

export type RootAppSidebarProps = {
  isPublicWorkspace: boolean;
  onOpenQuickSearchModal: () => void;
  onOpenSettingModal: () => void;
  currentWorkspace: Workspace;
  openPage: (pageId: string) => void;
  createPage: () => Store;
  paths: {
    all: (workspaceId: string) => string;
    trash: (workspaceId: string) => string;
    shared: (workspaceId: string) => string;
  };
};

const IconSidebarButton = ({
  icon,
  active,
  onClick,
  'data-testid': testId,
}: {
  icon: ReactElement;
  active?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}) => {
  return (
    <div
      className={iconButton}
      data-active={active}
      onClick={onClick}
      data-testid={testId}
      tabIndex={0}
    >
      <div className={iconButtonIcon}>{icon}</div>
    </div>
  );
};

const IconAllDocsButton = () => {
  const { workbenchService } = useServices({
    WorkbenchService,
  });
  const workbench = workbenchService.workbench;
  const allPageActive = useLiveData(
    workbench.location$.selector(location => location.pathname === '/all')
  );

  const handleNavigate = useCallback(() => {
    workbench.open('/all');
  }, [workbench]);

  return (
    <IconSidebarButton
      icon={<AllDocsIcon />}
      active={allPageActive}
      onClick={handleNavigate}
      data-testid="icon-all-docs"
    />
  );
};

const IconJournalButton = () => {
  const workbench = useService(WorkbenchService).workbench;
  const location = useLiveData(workbench.location$);
  const isActive = location.pathname.startsWith('/journals');

  const handleNavigate = useCallback(() => {
    workbench.open('/journals');
  }, [workbench]);

  return (
    <IconSidebarButton
      icon={<TodayIcon />}
      active={isActive}
      onClick={handleNavigate}
      data-testid="icon-journal"
    />
  );
};

const IconAIChatButton = () => {
  const featureFlagService = useService(FeatureFlagService);
  const serverService = useService(ServerService);
  const serverFeatures = useLiveData(serverService.server.features$);
  const enableAI = useLiveData(featureFlagService.flags.enable_ai.$);

  const { workbenchService } = useServices({
    WorkbenchService,
  });
  const workbench = workbenchService.workbench;
  const aiChatActive = useLiveData(
    workbench.location$.selector(location => location.pathname === '/chat')
  );

  const handleNavigate = useCallback(() => {
    workbench.open('/chat');
  }, [workbench]);

  if (!enableAI || !serverFeatures?.copilot) {
    return null;
  }

  return (
    <IconSidebarButton
      icon={<AiOutlineIcon />}
      active={aiChatActive}
      onClick={handleNavigate}
      data-testid="icon-ai-chat"
    />
  );
};

const IconQuickSearchButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <IconSidebarButton
      icon={<SearchIcon />}
      onClick={onClick}
      data-testid="icon-quick-search"
    />
  );
};

const IconSettingsButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <IconSidebarButton
      icon={<SettingsIcon />}
      onClick={onClick}
      data-testid="icon-settings"
    />
  );
};

const IconWorkspaceButton = () => {
  const { workspacesService, globalContextService } = useServices({
    GlobalContextService,
    WorkspacesService,
  });
  const { jumpToPage } = useNavigateHelper();
  const workbench = useService(WorkbenchService).workbench;
  const [open, setOpen] = useState(false);

  const currentWorkspaceId = useLiveData(
    globalContextService.globalContext.workspaceId.$
  );
  const currentWorkspaceMetadata = useLiveData(
    currentWorkspaceId
      ? workspacesService.list.workspace$(currentWorkspaceId)
      : null
  );

  const handleClickWorkspace = useCallback(
    (workspaceMetadata: { id: string }) => {
      const closeInactiveViews = () =>
        workbench.views$.value.forEach(view => {
          if (workbench.activeView$.value !== view) {
            workbench.close(view);
          }
        });

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          closeInactiveViews();
          jumpToPage(workspaceMetadata.id, 'all');
          return new Promise(resolve => setTimeout(resolve, 150));
        });
      } else {
        closeInactiveViews();
        jumpToPage(workspaceMetadata.id, 'all');
      }
      setOpen(false);
    },
    [jumpToPage, workbench]
  );

  if (!currentWorkspaceMetadata) {
    return null;
  }

  const isCloud = currentWorkspaceMetadata.flavour !== 'local';
  const WorkspaceIcon = isCloud ? CloudWorkspaceIcon : LocalWorkspaceIcon;

  return (
    <Menu
      rootOptions={{
        open,
        onOpenChange: setOpen,
      }}
      items={
        <UserWithWorkspaceList onClickWorkspace={handleClickWorkspace} />
      }
      contentOptions={{
        sideOffset: -32,
        style: {
          width: '300px',
          maxHeight: 'min(800px, calc(100vh - 200px))',
          padding: 0,
        },
      }}
    >
      <div
        className={workspaceButton}
        data-testid="icon-workspace"
        tabIndex={0}
        onClick={() => {
          track.$.navigationPanel.workspaceList.open();
          setOpen(true);
        }}
      >
        <div className={iconButtonIcon}>
          <WorkspaceIcon />
        </div>
      </div>
    </Menu>
  );
};

const IconMoreButton = ({
  onOpenImportModal,
}: {
  onOpenImportModal: () => void;
}) => {
  const t = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Menu
      rootOptions={{
        open,
        onOpenChange: setOpen,
      }}
      contentOptions={{
        sideOffset: -32,
        className: navigationMenuContent,
        style: {
          width: '240px',
          maxHeight: 'min(600px, calc(100vh - 100px))',
          padding: '12px',
          overflowY: 'auto',
        },
      }}
      items={
        <div style={{ padding: '8px 0' }}>
          <NavigationPanelFavorites />
          <NavigationPanelOrganize />
          <NavigationPanelMigrationFavorites />
          <NavigationPanelTags />
          <NavigationPanelCollections />
          <CollapsibleSection
            path={['others']}
            title={t['com.affine.rootAppSidebar.others']()}
            contentStyle={{ padding: '8px 4px 0 4px' }}
          >
            <TrashButton />
            <MenuItem
              data-testid="slider-bar-import-button"
              icon={<ImportIcon />}
              onClick={onOpenImportModal}
            >
              <span data-testid="import-modal-trigger">{t['Import']()}</span>
            </MenuItem>
            <InviteMembersButton />
            <TemplateDocEntrance />
          </CollapsibleSection>
        </div>
      }
    >
      <div
        className={iconButton}
        data-testid="icon-more"
        tabIndex={0}
        onClick={() => setOpen(true)}
      >
        <div className={iconButtonIcon}>
          <BulletedListIcon />
        </div>
      </div>
    </Menu>
  );
};

export const RootAppSidebar = memo((): ReactElement => {
  const { workbenchService, cMDKQuickSearchService } = useServices({
    WorkbenchService,
    CMDKQuickSearchService,
  });

  const workspaceDialogService = useService(WorkspaceDialogService);
  const workbench = workbenchService.workbench;
  const onOpenQuickSearchModal = useCallback(() => {
    cMDKQuickSearchService.toggle();
  }, [cMDKQuickSearchService]);

  const onOpenSettingModal = useCallback(() => {
    workspaceDialogService.open('setting', {
      activeTab: 'appearance',
    });
    track.$.navigationPanel.$.openSettings();
  }, [workspaceDialogService]);

  const handleOpenDocs = useCallback(
    (result: {
      docIds: string[];
      entryId?: string;
      isWorkspaceFile?: boolean;
    }) => {
      const { docIds, entryId, isWorkspaceFile } = result;
      if (isWorkspaceFile && entryId) {
        workbench.openDoc(entryId);
      } else if (!docIds.length) {
        return;
      }
      if (docIds.length > 1) {
        workbench.openAll();
      } else {
        workbench.openDoc(docIds[0]);
      }
    },
    [workbench]
  );

  const onOpenImportModal = useCallback(() => {
    track.$.navigationPanel.importModal.open();
    workspaceDialogService.open('import', undefined, payload => {
      if (!payload) {
        return;
      }
      handleOpenDocs(payload);
    });
  }, [workspaceDialogService, handleOpenDocs]);

  return (
    <AppSidebar>
      <SidebarContainer className={iconSidebarContainer}>
        <UserInfo />
        <IconWorkspaceButton />
        <div className={divider} />
        <IconQuickSearchButton onClick={onOpenQuickSearchModal} />
        <IconAllDocsButton />
        <IconJournalButton />
        <IconAIChatButton />
        <div className={divider} />
        <IconMoreButton onOpenImportModal={onOpenImportModal} />
        <div className={spacer} />
        <IconSettingsButton onClick={onOpenSettingModal} />
      </SidebarContainer>
    </AppSidebar>
  );
});

RootAppSidebar.displayName = 'memo(RootAppSidebar)';
