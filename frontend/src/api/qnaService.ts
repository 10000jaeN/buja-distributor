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
};
