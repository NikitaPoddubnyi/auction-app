import { $axios } from './client';

export interface Lot {
  id: string;
  title: string;
  description?: string;
  startPrice: number;
  currentPrice: number;
  endTime: string;
  status: 'ACTIVE' | 'CLOSED';
  creatorId: string;
  winnerId?: string;
  creator: { id: string; firstName: string; lastName: string };
  winner?: { id: string; firstName: string; lastName: string } | null;
  logo?: { url: string } | null;
  bids?: Bid[];
  _count?: { bids: number };
}

export interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  bidderId: string;
  bidder: { id: string; firstName: string; lastName: string };
}

export const lotsApi = {
  getAll: async (page = 1, limit = 5) => {
    const { data } = await $axios.get('/lots/all', { params: { page, limit } });
    return data as { items: Lot[]; meta: any };
  },

  getOne: async (id: string) => {
    const { data } = await $axios.get(`/lots/${id}`);
    return data as Lot;
  },

  create: async (formData: FormData) => {
    const { data } = await $axios.post('/lots', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as Lot;
  },
};
