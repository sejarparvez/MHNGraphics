import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/constant/QueryKeys';
import { useDebounce } from '@/hooks/useDebounce';
import apiClient from '@/lib/apiClient';
import type { NewDesignSchemaType } from '@/lib/Schemas';
import type { Design } from '@/utils/Interface';

// Common fetch function
async function fetchDesignData(url: string, params: object) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
    // biome-ignore lint: error
  } catch (error) {
    throw new Error('Failed to fetch data');
  }
}

interface Props {
  page: number;
  category: string;
  searchQuery: string;
  tag?: string;
}

// Fetch for User Design
export function useFetchUserDesign({
  page,
  category,
  searchQuery,
  tag,
}: Props) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: [
      QUERY_KEYS.USER_DESIGN,
      page,
      category,
      debouncedSearchQuery,
      tag,
    ],
    queryFn: () =>
      fetchDesignData('/api/design/user-design', {
        page,
        category,
        searchQuery: debouncedSearchQuery,
        tag,
        pageSize: 24,
      }),
  });
}

// Fetch for All Design
export function useFetchAllDesign({ page, category, searchQuery, tag }: Props) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: [
      QUERY_KEYS.ALL_DESIGN,
      page,
      category,
      debouncedSearchQuery,
      tag,
    ],
    queryFn: () =>
      fetchDesignData('/api/design/all-design', {
        page,
        category,
        searchQuery: debouncedSearchQuery,
        tag,
      }),
  });
}

export const useCreateDesign = (resetForm: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Create the axios promise.
      const apiPromise = apiClient.post('/api/design/single-design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Use toast.promise to show loading, success, and error notifications.
      toast.promise(apiPromise, {
        loading: 'Uploading, please wait...',
        success: 'Design successfully added',
        // biome-ignore lint: error
        error: (err: any) => err?.message || 'Failed to add Design',
      });
      // Return the axios promise with a chained then.
      return apiPromise.then((response) => {
        if (response.status !== 200) {
          throw new Error('Server error');
        }
        return response.data;
      });
    },
    onSuccess: () => {
      resetForm();
      // Invalidate queries so that the data refetches.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_DESIGN] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_DESIGN] });
    },
  });
};

export const useDeleteDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const deletePromise = apiClient
        .delete<{ message: string }>(`/api/design/single-design?id=${id}`)
        .then((res) => res.data); // Unwrap response before passing to toast

      return toast.promise(deletePromise, {
        loading: 'Deleting design...',
        success: (data) => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_DESIGN] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_DESIGN] });
          return data.message || 'Design deleted successfully ✅';
        },
        error: (error) =>
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to delete design ❌'
            : 'Something went wrong. Please try again.',
      });
    },
  });
};

export const useUpdateDesignStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updatePromise = apiClient
        .patch<{
          message: string;
        }>(`/api/design/single-design?id=${id}`, { status })
        .then((res) => res.data); // Unwrap response before passing to toast

      return toast.promise(updatePromise, {
        loading: 'Updating design status...',
        success: (data) => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_DESIGN] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_DESIGN] });
          return data.message || 'Design updated successfully 🎉';
        },
        error: (error) =>
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to update design ❌'
            : 'Something went wrong. Please try again.',
      });
    },
  });
};

export function useSingleDesign({ id }: { id: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.SINGLE_DESIGN, id],
    queryFn: async () => {
      const response = await axios.get(`/api/design/single-design?id=${id}`);
      return response.data;
    },
  });
}

export function useIncrementViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(
        `/api/design/single-design/view?id=${id}`,
      );
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData<Design>([QUERY_KEYS.SINGLE_DESIGN, id], (old) =>
        old ? { ...old, viewCount: data.viewCount } : undefined,
      );
    },
  });
}

export function useRelatedDesign(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.RELATED_DESIGN, id],
    queryFn: async () => {
      const response = await axios.get(`/api/design/related-design?id=${id}`);
      return response.data;
    },
  });
}

interface UseUpdateDesignProps {
  designId: string;
  imageFile: File | null;
}

export function useUpdateDesign({ designId, imageFile }: UseUpdateDesignProps) {
  const queryClient = useQueryClient();

  const updateDesignMutation = useMutation({
    mutationFn: async (formData: NewDesignSchemaType) => {
      if (!designId) {
        throw new Error('Design ID is missing');
      }

      const submissionData = new FormData();

      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submissionData.append(key, value.toString());
        }
      });

      submissionData.append('productId', designId);

      if (imageFile) {
        submissionData.append('image', imageFile);
      }

      const response = await apiClient.patch(
        '/api/design/edit-design',
        submissionData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the design query to update the UI
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SINGLE_DESIGN, designId],
      });
    },
  });

  const submitDesignUpdate = (formData: NewDesignSchemaType) => {
    return toast.promise(updateDesignMutation.mutateAsync(formData), {
      loading: 'Updating design...',
      success: 'Design successfully updated',
      error: (err) =>
        `Error: ${err instanceof Error ? err.message : 'Failed to update design'}`,
    });
  };

  return {
    updateDesignMutation,
    submitDesignUpdate,
    isPending: updateDesignMutation.isPending,
    isError: updateDesignMutation.isError,
    error: updateDesignMutation.error,
  };
}

// Define the function that handles updating the like status
export function useUpdateDesignLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      userId,
    }: {
      postId: string;
      userId: string;
    }) => {
      const updatePromise = axios
        .post<{ message: string }>(`/api/design/single-design/like`, {
          postId,
          userId,
        })
        .then((res) => res.data);

      return toast.promise(updatePromise, {
        loading: 'Updating like status...',
        success: (data) => {
          // Invalidate the queries related to design so it will refetch and update the UI
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.SINGLE_DESIGN, postId],
          });
          return data.message || 'Like status updated successfully 🎉';
        },
        error: (error) =>
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to update like status ❌'
            : 'Something went wrong. Please try again.',
      });
    },
  });
}
