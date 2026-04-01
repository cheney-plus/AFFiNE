import { Loading } from '@affine/component';
import {
  SettingHeader,
  SettingWrapper,
} from '@affine/component/setting-components';
import { WorkspaceSubscriptionService } from '@affine/core/modules/cloud';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { useEffect } from 'react';

import { BillingHistory } from './billing-history';
import { PaymentMethodUpdater } from './payment-method';
import { TeamCard } from './team-card';
import { TypeformLink } from './typeform-link';

export const WorkspaceSettingBilling = () => {
  const workspace = useService(WorkspaceService).workspace;

  const t = useI18n();

  const subscriptionService = workspace?.scope.get(
    WorkspaceSubscriptionService
  );
  const subscription = useLiveData(
    subscriptionService?.subscription.subscription$
  );

  useEffect(() => {
    subscriptionService?.subscription.revalidate();
  }, [subscriptionService?.subscription]);

  if (workspace === null) {
    return null;
  }

  if (!subscription) {
    return <Loading />;
  }

  return (
    <>
      <SettingHeader
        title={t['com.affine.payment.billing-setting.title']()}
        subtitle={t['com.affine.payment.billing-setting.subtitle']()}
      />
      <SettingWrapper
        title={t['com.affine.payment.billing-setting.information']()}
      >
        <TeamCard />
        <TypeformLink />
        <PaymentMethodUpdater />
      </SettingWrapper>

      <SettingWrapper title={t['com.affine.payment.billing-setting.history']()}>
        <BillingHistory />
      </SettingWrapper>
    </>
  );
};
