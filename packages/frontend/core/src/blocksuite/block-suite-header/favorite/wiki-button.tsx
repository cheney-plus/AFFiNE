import { WikiTag } from '@affine/core/components/page-list';
import { DocService } from '@affine/core/modules/doc';
import { toast } from '@affine/core/utils';
import { extractMarkdownFromDoc } from '@affine/core/blocksuite/ai/utils/extract';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

const WIKI_API_BASE = 'http://localhost:1570/api/wiki';

async function checkWikiStatus(docId: string): Promise<boolean> {
  try {
    const res = await fetch(`${WIKI_API_BASE}/check?doc_id=${docId}`);
    const data = await res.json();
    return data.exists === true;
  } catch {
    return false;
  }
}

async function generateWiki(docId: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(`${WIKI_API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: docId, content }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function deleteWiki(docId: string): Promise<boolean> {
  try {
    const res = await fetch(`${WIKI_API_BASE}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: docId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const WikiButton = () => {
  const doc = useService(DocService).doc;
  const docId = doc.id;
  const blockSuiteDoc = doc.blockSuiteDoc;

  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    checkWikiStatus(docId).then(exists => {
      if (!cancelled) {
        setIsActive(exists);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [docId]);

  const handleWiki = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const willBeActive = !isActive;

    if (willBeActive) {
      toast('该笔记正在建立维基索引，请稍等！');
      try {
        const content = await extractMarkdownFromDoc(blockSuiteDoc);
        const success = await generateWiki(docId, content);
        if (success) {
          setIsActive(true);
          toast('维基索引建立成功');
        } else {
          toast('维基索引建立失败');
        }
      } catch {
        toast('维基索引建立失败');
      }
    } else {
      const success = await deleteWiki(docId);
      if (success) {
        setIsActive(false);
        toast('维基索引删除成功');
      } else {
        toast('维基索引删除失败');
      }
    }

    setLoading(false);
  }, [isActive, loading, docId, blockSuiteDoc]);

  return (
    <WikiTag
      data-testid="wiki-button"
      active={isActive}
      onClick={handleWiki}
    />
  );
};
