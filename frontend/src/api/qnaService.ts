import { apiClient } from "@/lib/apiClient";
import { Qna, CreateQnaInput } from "@/types/qna";

export const qnaService = {
  getQnaList: async (productId: string): Promise<Qna[]> => {
    const res = await apiClient.get<{ data: Qna[] }>(`/qna?productId=${productId}`);
    return res.data;
  },

  createQna: async (data: CreateQnaInput): Promise<Qna> => {
    const res = await apiClient.post<{ data: Qna }>("/qna", data);
    return res.data;
  },

  deleteQna: async (qnaId: string): Promise<void> => {
    await apiClient.delete(`/qna/${qnaId}`);
  },

  getMyQnaList: async (): Promise<Qna[]> => {
    const res = await apiClient.get<{ data: Qna[] }>("/qna/my");
    return res.data;
  },

  getMyUnreadAnswerCount: async (since?: string): Promise<number> => {
    const params = since ? `?since=${encodeURIComponent(since)}` : "";
    const res = await apiClient.get<{ count: number }>(`/qna/my/unread-count${params}`);
    return res.count;
  },
};
