import { apiClient } from "@/lib/apiClient";

export type AdminQna = {
  _id: string;
  productId: { _id: string; name: string; slug: string };
  userId: { _id: string; nickName: string };
  content: string;
  isSecret: boolean;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
};

export const adminQnaService = {
  getQnaList: async (answered?: "true" | "false"): Promise<AdminQna[]> => {
    const params = answered !== undefined ? `?answered=${answered}` : "";
    const res = await apiClient.get<{ data: AdminQna[] }>(`/qna/admin/all${params}`);
    return res.data;
  },

  getUnansweredCount: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>("/qna/admin/unanswered-count");
    return res.count;
  },

  answerQna: async (qnaId: string, answer: string): Promise<AdminQna> => {
    const res = await apiClient.post<{ data: AdminQna }>(`/qna/${qnaId}/answer`, { answer });
    return res.data;
  },

  deleteQna: async (qnaId: string): Promise<void> => {
    await apiClient.delete(`/qna/${qnaId}`);
  },
};
