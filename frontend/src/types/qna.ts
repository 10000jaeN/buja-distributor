export type Qna = {
  _id: string;
  productId: string | { _id: string; name: string; slug: string };
  userId: { _id: string; nickName: string };
  content: string | null;
  isSecret: boolean;
  answer?: string | null;
  answeredAt?: string | null;
  createdAt: string;
};

export type CreateQnaInput = {
  productId: string;
  content: string;
  isSecret: boolean;
};
