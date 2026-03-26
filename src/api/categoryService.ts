import axiosInstance from "@/lib/axios";
import { Category } from "@/types/product";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosInstance.get<{ data: Category[] }>("/categories");
    return res.data.data;
  },

  createCategory: async (data: { parent: string; children?: string[] }): Promise<Category> => {
    const res = await axiosInstance.post<{ data: Category }>("/categories", data);
    return res.data.data;
  },

  updateCategory: async (
    parent: string,
    data: { newParent?: string; children?: string[] }
  ): Promise<Category> => {
    const res = await axiosInstance.patch<{ data: Category }>(
      `/categories/${encodeURIComponent(parent)}`,
      data
    );
    return res.data.data;
  },

  deleteCategory: async (parent: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${encodeURIComponent(parent)}`);
  },

  addChild: async (parent: string, child: string): Promise<Category> => {
    const res = await axiosInstance.post<{ data: Category }>(
      `/categories/${encodeURIComponent(parent)}/children`,
      { child }
    );
    return res.data.data;
  },

  updateChild: async (parent: string, child: string, newChild: string): Promise<Category> => {
    const res = await axiosInstance.patch<{ data: Category }>(
      `/categories/${encodeURIComponent(parent)}/children/${encodeURIComponent(child)}`,
      { newChild }
    );
    return res.data.data;
  },

  removeChild: async (parent: string, child: string): Promise<void> => {
    await axiosInstance.delete(
      `/categories/${encodeURIComponent(parent)}/children/${encodeURIComponent(child)}`
    );
  },

  reorderCategories: async (orderedParents: string[]): Promise<void> => {
    await axiosInstance.patch("/categories/reorder", { orderedParents });
  },
};
