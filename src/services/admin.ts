import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/constant/QueryKeys';
import { useDebounce } from '@/hooks/useDebounce';

export function useFetchAdminData() {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DATA],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/data`);
      return response.data;
    },
  });
}

export function FetchRecentApplication() {
  return useQuery({
    queryKey: ['Recent applications'],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/recent-data/application`);
      return response.data;
    },
  });
}
export function FetchRecentDesign() {
  return useQuery({
    queryKey: ['Recent design'],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/recent-data/design`);
      return response.data;
    },
  });
}

export function useFetchUserDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_DASHBOARD],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/user-dashboard`);
      return response.data;
    },
  });
}

export function useFetchDuration() {
  return useQuery({
    queryKey: [QUERY_KEYS.APPLICATION_DURATION],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/duration`);
      return response.data;
    },
  });
}

export function useUserStatusUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updatePromise = axios
        .patch<{ message: string }>(`/api/profile?id=${id}`, {
          status,
        })
        .then((res) => res.data);
      return toast.promise(updatePromise, {
        loading: 'Updating user status...',
        success: (data) => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_LIST] });
          return data.message || 'Status updated successfully 🎉';
        },
        error: (error) =>
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to update Status ❌'
            : 'Something went wrong. Please try again.',
      });
    },
  });
}

export const useUpdateDesignStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updatePromise = axios
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
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const updatePromise = axios
        .delete<{ message: string }>(`/api/users?id=${id}`)
        .then((res) => res.data);

      return toast.promise(updatePromise, {
        loading: 'Deleting user...',
        success: (data) => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_LIST] });
          return data.message || 'User deleted successfully 🎉';
        },
        error: (error) =>
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to delete user ❌'
            : 'Something went wrong. Please try again.',
      });
    },
  });
}

interface Props {
  page: number;
  pageSize?: number;
  searchQuery: string;
}

export function useUserList({ page, searchQuery, pageSize = 30 }: Props) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: [QUERY_KEYS.USER_LIST, page, debouncedSearchQuery, pageSize],
    queryFn: async () => {
      const response = await axios.get(`/api/users`, {
        params: { page, searchQuery: debouncedSearchQuery, pageSize },
      });
      return response.data;
    },
  });
}

export const useDurationToggle = (
  visibility: boolean,
  setVisibility: (value: boolean) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newData: boolean) => {
      return axios.patch(
        'api/admin/duration',
        { button: newData ? 'On' : 'Off' },
        { withCredentials: true },
      );
    },
    onSuccess: (_, newData) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.APPLICATION_DURATION],
      }); // Refetch data
      setVisibility(newData); // Update state
    },
  });

  const handleSwitchChange = async () => {
    const newData = !visibility;

    await toast.promise(mutation.mutateAsync(newData), {
      loading: 'Please wait...',
      success: 'Status updated successfully',
      error: 'Error updating status',
    });
  };

  return { handleSwitchChange, isLoading: mutation.isPending };
};

export function useCommentList({ page, searchQuery, pageSize = 30 }: Props) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: [QUERY_KEYS.COMMENT_LIST, page, debouncedSearchQuery, pageSize],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/recent-data/comments`, {
        params: { page, searchQuery: debouncedSearchQuery, pageSize },
      });
      return response.data;
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const updatePromise = axios
        .delete<{
          message: string;
        }>(`/api/design/single-design/comments?commentId=${id}`)
        .then((res) => res.data);

      return toast.promise(updatePromise, {
        loading: 'Deleting Comment...',
        success: (data) => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.COMMENT_LIST],
          });
          return data.message || 'Comment deleted successfully 🎉';
        },
        error: (error) =>
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to delete comment ❌'
            : 'Something went wrong. Please try again.',
      });
    },
  });
}

export function usePaymentAnalytics() {
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_ANALYTICS],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/payment`);
      return response.data;
    },
  });
}
