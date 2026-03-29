import { toast } from '@affine/component';
import {
  pushGlobalLoadingEventAtom,
  resolveGlobalLoadingEventAtom,
} from '@affine/component/global-loading';
import {
  AIProvider,
  CopilotClient,
  setupAIProvider,
} from '@affine/core/blocksuite/ai';
import { useRegisterFindInPageCommands } from '@affine/core/components/hooks/affine/use-register-find-in-page-commands';
import { useRegisterWorkspaceCommands } from '@affine/core/components/hooks/use-register-workspace-commands';
import { OverCapacityNotification } from '@affine/core/components/over-capacity';
import {
  AuthService,
  EventSourceService,
  GraphQLService,
} from '@affine/core/modules/cloud';
import {
  GlobalDialogService,
  WorkspaceDialogService,
} from '@affine/core/modules/dialogs';
import { DocsService } from '@affine/core/modules/doc';
import { EditorSettingService } from '@affine/core/modules/editor-setting';
import { useRegisterNavigationCommands } from '@affine/core/modules/navigation/view/use-register-navigation-commands';
import { QuickSearchContainer } from '@affine/core/modules/quicksearch';
import { WorkbenchService } from '@affine/core/modules/workbench';
import {
  getAFFiNEWorkspaceSchema,
  WorkspaceService,
} from '@affine/core/modules/workspace';
import { apis } from '@affine/electron-api';
import { useI18n } from '@affine/i18n';
import track from '@affine/track';
import type { DocMode } from '@blocksuite/affine/model';
import { ZipTransformer } from '@blocksuite/affine/widgets/linked-doc';
import {
  effect,
  fromPromise,
  onStart,
  throwIfAborted,
  useLiveData,
  useService,
  useServices,
} from '@toeverything/infra';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { catchError, EMPTY, finalize, switchMap, tap, timeout } from 'rxjs';

/**
 * @deprecated just for legacy code, will be removed in the future
 */
export const WorkspaceSideEffects = () => {
  const t = useI18n();
  const pushGlobalLoadingEvent = useSetAtom(pushGlobalLoadingEventAtom);
  const resolveGlobalLoadingEvent = useSetAtom(resolveGlobalLoadingEventAtom);
  const { workspaceService, docsService } = useServices({
    WorkspaceService,
    DocsService,
    EditorSettingService,
  });
  const currentWorkspace = workspaceService.workspace;
  const docsList = docsService.list;

  const workbench = useService(WorkbenchService).workbench;
  useEffect(() => {
    const insertTemplate = effect(
      switchMap(({ template, mode }: { template: string; mode: string }) => {
        return fromPromise(async abort => {
          const templateZip = await fetch(template, { signal: abort });
          const templateBlob = await templateZip.blob();
          throwIfAborted(abort);
          const [doc] = await ZipTransformer.importDocs(
            currentWorkspace.docCollection,
            getAFFiNEWorkspaceSchema(),
            templateBlob
          );
          if (doc) {
            doc.resetHistory();
          }

          return { doc, mode };
        }).pipe(
          timeout(10000 /* 10s */),
          tap(({ mode, doc }) => {
            if (doc) {
              docsList.setPrimaryMode(doc.id, mode as DocMode);
              workbench.openDoc(doc.id);
            }
          }),
          onStart(() => {
            pushGlobalLoadingEvent({
              key: 'insert-template',
            });
          }),
          catchError(err => {
            console.error(err);
            toast(t['com.affine.ai.template-insert.failed']());
            return EMPTY;
          }),
          finalize(() => {
            resolveGlobalLoadingEvent('insert-template');
          })
        );
      })
    );

    const disposable = AIProvider.slots.requestInsertTemplate.subscribe(
      ({ template, mode }) => {
        insertTemplate({ template, mode });
      }
    );

    return () => {
      disposable.unsubscribe();
      insertTemplate.unsubscribe();
    };
  }, [
    currentWorkspace.docCollection,
    docsList,
    pushGlobalLoadingEvent,
    resolveGlobalLoadingEvent,
    t,
    workbench,
  ]);

  const workspaceDialogService = useService(WorkspaceDialogService);
  const globalDialogService = useService(GlobalDialogService);

  useEffect(() => {
    const disposable = AIProvider.slots.requestUpgradePlan.subscribe(() => {
      workspaceDialogService.open('setting', {
        activeTab: 'billing',
      });
      track.$.paywall.aiAction.viewPlans();
    });
    return () => {
      disposable.unsubscribe();
    };
  }, [workspaceDialogService]);

  const graphqlService = useService(GraphQLService);
  const eventSourceService = useService(EventSourceService);
  const authService = useService(AuthService);
  const editorSettingService = useService(EditorSettingService);
  const editorSettings = useLiveData(
    editorSettingService.editorSetting.settings$
  );

  useEffect(() => {
    const dispose = setupAIProvider(
      new CopilotClient(graphqlService.gql, eventSourceService.eventSource),
      globalDialogService,
      authService,
      editorSettingService
    );
    return () => {
      dispose();
    };
  }, [
    eventSourceService,
    workspaceDialogService,
    graphqlService,
    globalDialogService,
    authService,
    editorSettingService,
  ]);

  useEffect(() => {
    if (!BUILD_CONFIG.isElectron || !editorSettings || !apis?.goServer) {
      return;
    }
    const baseUrlByProvider = {
      DeepSeek: 'https://api.deepseek.com',
      Qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      Kimi: 'https://api.moonshot.cn/v1',
      GLM: 'https://open.bigmodel.cn/api/paas/v4',
      Doubao: 'https://ark.cn-beijing.volces.com/api/v3',
    } as const;
    const defaultModelByProvider = {
      DeepSeek: 'deepseek-chat',
      Qwen: 'qwen-plus',
      Kimi: 'moonshot-v1-8k',
      GLM: 'glm-4-plus',
      Doubao: 'doubao-pro-32k',
    } as const;

    const provider = editorSettings.aiModelProvider;
    const model = editorSettings.aiModelName.trim();
    void apis.goServer
      .setConfig({
        baseUrl: baseUrlByProvider[provider] ?? 'https://api.deepseek.com',
        apiKey: editorSettings.aiModelKey.trim(),
        model: model || defaultModelByProvider[provider] || 'deepseek-chat',
      })
      .catch(console.error);
  }, [
    editorSettings?.aiModelKey,
    editorSettings?.aiModelName,
    editorSettings?.aiModelProvider,
  ]);

  useRegisterWorkspaceCommands();
  useRegisterNavigationCommands();
  useRegisterFindInPageCommands();

  return (
    <>
      <QuickSearchContainer />
      <OverCapacityNotification />
    </>
  );
};
