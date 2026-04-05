import {
  Avatar,
  Divider,
  Menu,
  type MenuProps,
} from '@affine/component';
import {
  type AuthAccountInfo,
  AuthService,
  ServerService,
} from '@affine/core/modules/cloud';
import { GlobalDialogService } from '@affine/core/modules/dialogs';
import { appSettingAtom } from '@toeverything/infra';
import { useAtomValue } from 'jotai';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback } from 'react';

import { avatarButton } from '../index.css';
import { Account } from './account';
import { AccountMenu } from './account-menu';
import { AIUsage } from './ai-usage';
import { CloudUsage } from './cloud-usage';
import * as styles from './index.css';
import { TeamList } from './team-list';
import { UnknownUserIcon } from './unknow-user';

export default function UserInfo() {
  const session = useService(AuthService).session;
  const account = useLiveData(session.account$);
  return account ? (
    <AuthorizedUserInfo account={account} />
  ) : (
    <UnauthorizedUserInfo />
  );
}

const menuContentOptions: MenuProps['contentOptions'] = {
  className: styles.operationMenu,
};
const AuthorizedUserInfo = ({ account }: { account: AuthAccountInfo }) => {
  return (
    <Menu items={<OperationMenu />} contentOptions={menuContentOptions}>
      <div
        className={avatarButton}
        data-testid="sidebar-user-avatar"
        tabIndex={0}
      >
        <Avatar size={24} name={account.label} url={account.avatar} />
      </div>
    </Menu>
  );
};

const UnauthorizedUserInfo = () => {
  const globalDialogService = useService(GlobalDialogService);
  const appSettings = useAtomValue(appSettingAtom);

  const openSignInModal = useCallback(() => {
    globalDialogService.open('sign-in', {});
  }, [globalDialogService]);

  if (appSettings.localUserAvatar) {
    return (
      <div
        className={avatarButton}
        onClick={openSignInModal}
        data-testid="sidebar-user-avatar"
        tabIndex={0}
      >
        <img
          src={appSettings.localUserAvatar}
          alt="Local user avatar"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={avatarButton}
      onClick={openSignInModal}
      data-testid="sidebar-user-avatar"
      tabIndex={0}
    >
      <UnknownUserIcon width={24} height={24} />
    </div>
  );
};

const OperationMenu = () => {
  const serverService = useService(ServerService);
  const serverFeatures = useLiveData(serverService.server.features$);

  return (
    <>
      <Account />
      <Divider />
      <CloudUsage />
      {serverFeatures?.copilot ? <AIUsage /> : null}
      <Divider />
      <TeamList />
      <AccountMenu />
    </>
  );
};
