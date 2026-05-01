import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { QUERY_KEYS } from '@/constant/QueryKeys';

// Check Balance
export function useCheckSMSBalance() {
  return useQuery({
    queryKey: [QUERY_KEYS.SMS_BALANCE],
    queryFn: async () => {
      const response = await axios.get('/api/sms/balance');
      return response.data;
    },
  });
}
