'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import type { BloodBankData, BloodBankQuery, Donor } from '@/utils/Interface';

const API_ENDPOINT = '/api/best-computer/blood-bank';

const BloodBankService = {
  fetchDonors: async ({
    currentPage,
    search,
    bloodGroup,
  }: BloodBankQuery): Promise<BloodBankData> => {
    try {
      const response = await axios.get(API_ENDPOINT, {
        params: {
          page: currentPage,
          search: search,
          bloodGroup: bloodGroup !== 'All' ? bloodGroup : undefined,
        },
      });
      return response.data;
    } catch (error) {
      // biome-ignore lint: error
      console.error('Error fetching donors:', error);
      throw error;
    }
  },

  deleteDonor: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_ENDPOINT}?id=${id}`);
    } catch (error) {
      // biome-ignore lint: error
      console.error('Error deleting donor:', error);
      throw error;
    }
  },

  createDonor: async (
    donor: Omit<Donor, 'id' | 'createdAt'>,
  ): Promise<Donor> => {
    try {
      const response = await axios.post(API_ENDPOINT, donor);
      return response.data;
    } catch (error) {
      // biome-ignore lint: error
      console.error('Error creating donor:', error);
      throw error;
    }
  },

  updateDonor: async (id: string, donor: Partial<Donor>): Promise<Donor> => {
    try {
      const response = await axios.patch(`${API_ENDPOINT}?id=${id}`, donor);
      return response.data;
    } catch (error) {
      // biome-ignore lint: error
      console.error('Error updating donor:', error);
      throw error;
    }
  },
};

export function useBloodBankData(params: BloodBankQuery) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['blood-bank', params],
    queryFn: () => BloodBankService.fetchDonors(params),
  });

  const deleteMutation = useMutation({
    mutationFn: BloodBankService.deleteDonor,
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood-bank'] });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const deleteDonor = async (id: string) => {
    try {
      const promise = deleteMutation.mutateAsync(id);

      toast.promise(promise, {
        loading: 'Deleting donor information...',
        success: 'Donor deleted successfully!',
        error: 'Failed to delete donor',
      });

      await promise;
    } catch (error) {
      // biome-ignore lint: error
      console.error('Delete error:', error);
    }
  };

  return {
    data,
    isLoading,
    isError,
    refetch,
    deleteDonor,
    isDeleting,
  };
}

interface Props {
  currentPage: number;
  filterBy: string;
  searchInput: string;
}

export function useAddress({ currentPage, filterBy, searchInput }: Props) {
  return useQuery({
    queryKey: ['address', currentPage, filterBy, searchInput],
    queryFn: async () => {
      const response = await axios.get(
        `/api/best-computer/blood-bank/address?page=${currentPage}&filterBy=${filterBy}&search=${searchInput}`,
      );
      return response.data;
    },
  });
}

export function useSingleDonar(id: string | string[]) {
  return useQuery({
    queryKey: ['Single donar', id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/best-computer/blood-bank/single-donar?id=${id}`,
      );
      return response.data;
    },
  });
}
