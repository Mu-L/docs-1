import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useCollaborationUrl } from '@/core/config';
import {
  KEY_DOC_CONTENT,
  useDocContent,
} from '@/docs/doc-management/api/useDocContent';
import { useProviderStore } from '@/docs/doc-management/stores/useProviderStore';
import { useBroadcastStore } from '@/stores/useBroadcastStore';

import { KEY_DOC } from '../api';

export const useCollaboration = (room: string) => {
  const collaborationUrl = useCollaborationUrl(room);
  const { addTask } = useBroadcastStore();
  const queryClient = useQueryClient();
  const { setBroadcastProvider, cleanupBroadcast } = useBroadcastStore();
  const {
    provider,
    createProvider,
    destroyProvider,
    isReady,
    hasLostConnection,
    resetLostConnection,
  } = useProviderStore();
  const { data: docContent } = useDocContent(
    { id: room },
    {
      staleTime: 30000, // 30 seconds - We keep the data fresh as it is a highly collaborative page
      queryKey: [KEY_DOC_CONTENT, { id: room }],
    },
  );

  /**
   * When the provider detects a lost connection, we invalidate the document query to trigger a refetch.
   * Because it can be because the user has access to the document that are modified
   * (e.g., permissions changed, document deleted, user removed)
   */
  useEffect(() => {
    if (hasLostConnection && room) {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DOC, { id: room }],
      });
      resetLostConnection();
    }
  }, [hasLostConnection, room, queryClient, resetLostConnection]);

  /**
   * We add a broadcast task to reset the query cache
   * when the document visibility changes.
   */
  useEffect(() => {
    if (!room || !isReady) {
      return;
    }

    addTask(`${KEY_DOC}-${room}`, () => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_DOC, { id: room }],
      });
    });
  }, [addTask, room, queryClient, isReady]);

  /**
   * Set the provider when the collaboration URL and the document content are available.
   */
  useEffect(() => {
    if (!room || !collaborationUrl || provider || docContent === undefined) {
      return;
    }

    const newProvider = createProvider(collaborationUrl, room, docContent);
    setBroadcastProvider(newProvider);
  }, [
    provider,
    collaborationUrl,
    createProvider,
    docContent,
    room,
    setBroadcastProvider,
  ]);

  /**
   * Destroy the provider when the component is unmounted
   */
  useEffect(() => {
    return () => {
      if (room) {
        cleanupBroadcast();
        destroyProvider();
      }
    };
  }, [destroyProvider, room, cleanupBroadcast]);
};
