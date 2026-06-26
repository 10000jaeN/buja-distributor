export type Qna = {
  _id: string;
  productId: string;
  userId: { _id: string; nickName: string };
  content: string;
  isSecret: boolean;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
};

export type CreateQnaInput = {
  productId: string;
  content: string;
  isSecret: boolean;
};
