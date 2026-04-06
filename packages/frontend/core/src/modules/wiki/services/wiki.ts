import { Service } from '@toeverything/infra';

import { DesktopApiService } from '../../desktop-api';

export interface WikiCheckResponse {
  exists: boolean;
  wiki_id?: string;
}

export interface WikiGenerateRequest {
  db_path: string;
  doc_id: string;
}

export interface WikiDeleteRequest {
  doc_id: string;
}

const WIKI_API_BASE_URL = 'http://localhost:1570/api/wiki';

export class WikiService extends Service {
  private get desktopApiService(): DesktopApiService | null {
    try {
      return this.framework.get(DesktopApiService);
    } catch {
      return null;
    }
  }

  private async getDbPath(workspaceId: string): Promise<string> {
    if (!BUILD_CONFIG.isElectron) {
      throw new Error('Wiki feature is only available in desktop app');
    }

    const desktopApi = this.desktopApiService;
    if (!desktopApi) {
      throw new Error('Desktop API is not available');
    }

    const appInfo = desktopApi.appInfo;
    if (!appInfo) {
      throw new Error('Failed to get app info');
    }

    const scheme = appInfo.scheme;
    const appName = scheme === 'affine' ? 'AFFiNE' : `AFFiNE-${scheme}`;

    const platform = process.platform;
    let appDataPath: string;

    if (platform === 'darwin') {
      appDataPath = `/Users/${process.env.USER}/Library/Application Support/${appName}`;
    } else if (platform === 'win32') {
      appDataPath = `${process.env.APPDATA}\\${appName}`;
    } else {
      appDataPath = `${process.env.HOME}/.config/${appName}`;
    }

    return `${appDataPath}/workspaces/local/${workspaceId}/storage.db`;
  }

  async checkWikiStatus(docId: string): Promise<WikiCheckResponse> {
    const response = await fetch(
      `${WIKI_API_BASE_URL}/check?doc_id=${docId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to check wiki status: ${response.statusText}`);
    }
    return response.json();
  }

  async generateWiki(workspaceId: string, docId: string): Promise<void> {
    const dbPath = await this.getDbPath(workspaceId);
    const response = await fetch(`${WIKI_API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        db_path: dbPath,
        doc_id: docId,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate wiki: ${response.statusText}`);
    }
  }

  async deleteWiki(docId: string): Promise<void> {
    const response = await fetch(`${WIKI_API_BASE_URL}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc_id: docId,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete wiki: ${response.statusText}`);
    }
  }
}
