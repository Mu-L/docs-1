import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Doc } from '../types';

import { KEY_CAN_EDIT } from './useDocCanEdit';

interface UpdateDocContentParams {
  id: Doc['id'];
  content: string; // Base64 encoded content
  websocket?: boolean;
}

export const updateDocContent = async ({
  id,
  content,
  websocket,
}: UpdateDocContentParams): Promise<void> => {
  const response = await fetchAPI(`documents/${id}/content/`, {
    method: 'PATCH',
    body: JSON.stringify({
      content,
      websocket,
    }),
  });

  if (!response.ok) {
    throw new APIError(
      'Failed to update the doc content',
      await errorCauses(response),
    );
  }
};

type UseDocContentUpdate = UseMutationOptions<
  void,
  APIError,
  UpdateDocContentParams
> & {
  listInvalidQueries?: string[];
};

export function useDocContentUpdate(queryConfig?: UseDocContentUpdate) {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, UpdateDocContentParams>({
    mutationFn: updateDocContent,
    ...queryConfig,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryConfig?.listInvalidQueries?.forEach((queryKey) => {
        void queryClient.resetQueries({
          queryKey: [queryKey],
        });
      });

      if (queryConfig?.onSuccess) {
        void queryConfig.onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      // If error it means the user is probably not allowed to edit the doc
      // so we invalidate the canEdit query to update the UI accordingly
      void queryClient.invalidateQueries({
        queryKey: [KEY_CAN_EDIT],
      });

      if (queryConfig?.onError) {
        queryConfig.onError(error, variables, onMutateResult, context);
      }
    },
  });
}
