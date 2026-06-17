import { $axios } from './client';
import type { Bid } from './lots';

export const bidsApi = {
  create: async (lotId: string, amount: number) => {
    const { data } = await $axios.post(`/lots/${lotId}/bids`, { amount });
    return data as Bid;
  },

  getAll: async (lotId: string, page = 1, limit = 1) => {
    const { data } = await $axios.get(`/lots/${lotId}/bids/all`, {
      params: { page, limit },
    });
    return data as { items: Bid[]; meta: any };
  },
};
