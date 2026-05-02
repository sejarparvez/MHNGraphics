import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import type { QuizListType } from '@/types/quiz-type';

export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

type SearchParams = {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: QuizDifficulty;
};

export function useQuizzes(searchParams: SearchParams) {
  const { page = 1, limit = 10, search = '', difficulty } = searchParams;

  return useQuery({
    queryKey: ['quizzes', page, limit, search, difficulty],
    queryFn: async () => {
      const response = await axios.get('/api/quiz', {
        params: {
          page,
          limit,
          search,
          difficulty,
        },
      });

      return response.data;
    },
  });
}

export function useQuizInfo(id: string) {
  return useQuery({
    queryKey: ['quizinfo', id],
    queryFn: async () => {
      const response = await axios.get(`/api/quiz/single-quiz?id=${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useSingleQuiz(id: string) {
  return useQuery({
    queryKey: ['quizwithquestions', id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/quiz/single-quiz/with-questions?id=${id}`,
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useSubmitQuiz() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
      timeSpent,
      tabSwitchCount,
    }: {
      quizId: string;
      answers: Record<string, string>;
      timeSpent: number;
      tabSwitchCount?: number;
    }) => {
      const response = await apiClient.post(`/api/quiz/submit`, {
        quizId,
        answers,
        timeSpent,
        tabSwitchCount,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // 1. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });

      // 2. Redirect the user to the results page
      router.push(`/quiz/quiz-result/stats/${data.quizResult.id}`);
      toast.success('Quiz submitted successfully!');
    },
    onError: (_error) => {
      // Handle global error logic here (e.g., logging)
      toast.error('Failed to submit quiz. Please try again.');
    },
  });
}

export function useSingleQuizResult(id: string) {
  return useQuery({
    queryKey: ['quiz-result', id],
    queryFn: async () => {
      const response = await axios.get(`/api/quiz/quiz-result?id=${id}`);
      return response.data;
    },
  });
}

export function useSingleQuizResultReview(id: string) {
  return useQuery({
    queryKey: ['quiz-result-review', id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/quiz/quiz-result/review-result?id=${id}`,
      );
      return response.data;
    },
  });
}

export function useAdminQuizList() {
  return useQuery<QuizListType[]>({
    queryKey: ['admin-quiz-list'],
    queryFn: async () => {
      const response = await axios.get(`/api/quiz/admin/quiz-list`);
      return response.data;
    },
  });
}

interface UseDeleteQuizOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteQuiz({
  onSuccess,
  onError,
}: UseDeleteQuizOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete('/api/quiz/admin', {
        params: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notices query to update the UI
      queryClient.invalidateQueries({
        queryKey: ['admin-quiz-list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['quizzes'],
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

export function useDuplicateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post('/api/quiz/admin/duplicate', { id });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-list'] });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    // biome-ignore lint/suspicious/noExplicitAny: this is fine
    mutationFn: async (quizData: any) => {
      const response = await axios.put('/api/quiz/admin', quizData);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-list'] });
      queryClient.invalidateQueries({
        queryKey: ['quizwithquestions', variables.id],
      });
    },
  });
}

export function useSingleAdminQuiz(id: string) {
  return useQuery({
    queryKey: ['single-admin-quiz', id],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/quiz/single-quiz?id=${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
