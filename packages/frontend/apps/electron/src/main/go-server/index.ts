import { type ChildProcess, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import type { IpcMainInvokeEvent } from 'electron';

import { beforeAppQuit } from '../cleanup';
import { logger } from '../logger';
import type { NamespaceHandlers } from '../type';

export type GoServerConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

const defaultGoServerConfig: GoServerConfig = {
  baseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-chat',
};

class GoServerManager {
  #childProcess: ChildProcess | null = null;
  #config: GoServerConfig = defaultGoServerConfig;

  setConfig(config: Partial<GoServerConfig>) {
    const nextConfig: GoServerConfig = {
      ...this.#config,
      ...config,
    };
    if (
      nextConfig.baseUrl === this.#config.baseUrl &&
      nextConfig.apiKey === this.#config.apiKey &&
      nextConfig.model === this.#config.model
    ) {
      return;
    }

    this.#config = nextConfig;
    this.restart();
  }

  stop() {
    const childProcess = this.#childProcess;
    if (!childProcess || childProcess.killed) {
      this.#childProcess = null;
      return;
    }
    try {
      childProcess.kill('SIGKILL');
    } catch (err) {
      logger.warn('[go-server] failed to kill process', err);
    } finally {
      this.#childProcess = null;
    }
  }

  private restart() {
    this.stop();
    this.start();
  }

  private start() {
    const baseUrl = this.#config.baseUrl.trim();
    const apiKey = this.#config.apiKey.trim();
    const model = this.#config.model.trim();

    if (!baseUrl || !apiKey || !model) {
      return;
    }

    const executablePath = this.resolveExecutablePath();
    const args = ['--base_url', baseUrl, '--api_key', apiKey, '--model', model];

    const childProcess = spawn(executablePath, args, {
      cwd: path.dirname(executablePath),
      windowsHide: true,
      stdio: 'ignore',
    });
    this.#childProcess = childProcess;

    childProcess.once('error', err => {
      logger.error('[go-server] process error', err);
      this.#childProcess = null;
    });
    childProcess.once('exit', (code, signal) => {
      logger.info('[go-server] process exited', { code, signal });
      if (this.#childProcess === childProcess) {
        this.#childProcess = null;
      }
    });
  }

  private resolveExecutablePath() {
    const buildDir = path.resolve(__dirname, '../../go-server/build');
    const preferred = this.getPreferredBinaryNames();
    const candidates = preferred
      .map(name => path.join(buildDir, name))
      .filter(filePath => fs.existsSync(filePath));

    if (candidates[0]) {
      return candidates[0];
    }

    const platformPrefix = this.getPlatformPrefix();
    const fallback = fs
      .readdirSync(buildDir)
      .find(file => file.startsWith(platformPrefix));
    if (fallback) {
      return path.join(buildDir, fallback);
    }

    throw new Error(`No go-server binary found in ${buildDir}`);
  }

  private getPreferredBinaryNames() {
    if (process.platform === 'darwin') {
      if (process.arch === 'arm64') {
        return ['friday-darwin-arm64'];
      }
      return ['friday-darwin-amd64', 'friday-darwin-x64'];
    }
    if (process.platform === 'linux') {
      if (process.arch === 'x64') {
        return ['friday-linux-amd64'];
      }
      if (process.arch === 'ia32') {
        return ['friday-linux-386'];
      }
      return ['friday-linux-amd64', 'friday-linux-386'];
    }
    if (process.platform === 'win32') {
      if (process.arch === 'x64') {
        return ['friday-windows-amd64.exe'];
      }
      return ['friday-windows-amd64.exe'];
    }
    return [];
  }

  private getPlatformPrefix() {
    if (process.platform === 'darwin') {
      return 'friday-darwin-';
    }
    if (process.platform === 'linux') {
      return 'friday-linux-';
    }
    if (process.platform === 'win32') {
      return 'friday-windows-';
    }
    return 'friday-';
  }
}

const goServerManager = new GoServerManager();

export const goServerHandlers = {
  setConfig: async (
    _e: IpcMainInvokeEvent,
    config: Partial<GoServerConfig>
  ): Promise<void> => {
    goServerManager.setConfig(config);
  },
} satisfies NamespaceHandlers;

export function initializeGoServerLifecycle() {
  beforeAppQuit(() => {
    goServerManager.stop();
  });
}
