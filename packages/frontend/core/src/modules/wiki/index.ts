import { Framework } from '@toeverything/infra';

import { WikiService } from './services/wiki';

export function configureWikiModule(framework: Framework) {
  framework.service(WikiService);
}

export { WikiService } from './services/wiki';
