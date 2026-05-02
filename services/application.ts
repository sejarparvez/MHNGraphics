import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { type AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { z } from 'zod';
import { QUERY_KEYS } from '@/constant/QueryKeys';
import { useDebounce } from '@/hooks/useDebounce';
import apiClient from '@/lib/apiClient';
import type { ApplicationSchema } from '@/lib/Schemas';

export const useSubmitApplication = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (
      values: z.infer<typeof ApplicationSchema>,
    ): Promise<AxiosResponse> => {
      const formData = new FormData();

      (Object.keys(values) as (keyof typeof values)[]).forEach((key) => {
        if (key === 'image' && values[key]) {
          formData.append('image', values[key][0]);
        } else {
          const value = values[key];
          if (value !== undefined && value !== null) {
            formData.append(key, value as string);
          }
        }
      });

      return apiClient.post('/api/best-computer/application', formData);
    },

    onSuccess: (response) => {
      if (response.status === 501) {
        return;
      }

      const url = response.data?.payment?.bkashURL || response.data?.url;

      if (url) {
        router.push(url);
      } else {
        router.push('/oylkka-it-and-training-center');
      }
    },

    onError: () => {
      return null;
    },
  });

  const submitApplication = async (
    values: z.infer<typeof ApplicationSchema>,
  ) => {
    return mutation.mutateAsync(values);
  };

  return {
    submitApplication,
    isSubmitting: mutation.status === 'pending',
  };
};
export const useUpdateApplication = (appId: string, refetch: () => void) => {
  const mutation = useMutation<AxiosResponse, Error, Record<string, string>>({
    mutationFn: async (updateFields) => {
      const formData = new FormData();
      formData.append('id', appId);
      Object.entries(updateFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      return apiClient.patch('/api/best-computer/application', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (data) => {
      if (data.status === 200) {
        refetch();
      }
    },
    onError: () => {
      return null;
    },
  });

  const updateApplicationData = async (
    updateFields: Record<string, string>,
  ) => {
    return toast.promise(mutation.mutateAsync(updateFields), {
      loading: 'Updating application...',
      success: 'Application updated successfully',
      error: 'Error updating application',
    });
  };

  return {
    updateApplicationData,
    isUpdating: mutation.status === 'pending',
  };
};

export const useDeleteApplication = (appId: string, refetch: () => void) => {
  const mutation = useMutation<AxiosResponse, Error, void>({
    mutationFn: async () => {
      return apiClient.delete(`/api/best-computer/application?id=${appId}`);
    },
    onSuccess: (data) => {
      if (data.status === 200) {
        refetch();
      }
    },
    onError: () => {
      return null;
    },
  });

  const deleteApplication = async () => {
    // Wrap the mutation call with toast.promise to handle notifications
    return toast.promise(mutation.mutateAsync(), {
      loading: 'Deleting application...',
      success: 'Application deleted successfully',
      error: 'Error deleting application',
    });
  };

  return {
    deleteApplication,
    isDeleting: mutation.status === 'pending', // Tanstack Query uses "pending" as the active state
  };
};

interface Props {
  page: number;
  filter: string;
  searchQuery: string;
  certificate: string;
  sortBy: string;
  type?: string;
}
export function useApplicationList({
  page,
  certificate,
  filter,
  searchQuery,
  sortBy,
  type,
}: Props) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  return useQuery({
    queryKey: [
      QUERY_KEYS.ALL_APPLICATION,
      page,
      filter,
      certificate,
      sortBy,
      debouncedSearchQuery,
      type,
    ],
    queryFn: async () => {
      const response = await axios.get(`/api/best-computer/all-application`, {
        params: {
          page,
          filter,
          certificate,
          sortBy,
          type,
          searchQuery: debouncedSearchQuery,
        },
      });
      return response.data;
    },
  });
}

export function useSingleApplication({ id }: { id: string }) {
  return useQuery({
    queryKey: ['Single Application', id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/best-computer/single-application?id=${id}`,
      );
      return response.data;
    },
  });
}

export function useUserApplication() {
  return useQuery({
    queryKey: ['User Application Data'],
    queryFn: async () => {
      const response = await axios.get(`/api/best-computer/application`);
      return response.data;
    },
  });
}
