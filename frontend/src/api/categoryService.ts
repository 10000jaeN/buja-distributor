import { apiClient } from "@/lib/apiClient";
import { Category } from "@/types/product";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<{ data: Category[] }>("/categories");
    return res.data;
  },

  createCategory: async (data: { parent: string; children?: string[] }): Promise<Category> => {
    const res = await apiClient.post<{ data: Category }>("/categories", data);
    return res.data;
  },

  updateCategory: async (
    parent: string,
    data: { newParent?: string; children?: string[] },
  ): Promise<Category> => {
    const res = await apiClient.patch<{ data: Category }>(
      `/categories/${encodeURIComponent(parent)}`,
      data,
    );
    return res.data;
  },

  deleteCategory: async (parent: string): Promise<void> => {
    await apiClient.delete(`/categories/${encodeURIComponent(parent)}`);
  },

  addChild: async (parent: string, child: string): Promise<Category> => {
    const res = await apiClient.post<{ data: Category }>(
      `/categories/${encodeURIComponent(parent)}/children`,
      { child },
    );
    return res.data;
  },

  updateChild: async (
    parent: string,
    child: string,
    newChild: string,
  ): Promise<Category> => {
    const res = await apiClient.patch<{ data: Category }>(
      `/categories/${encodeURIComponent(parent)}/children/${encodeURIComponent(child)}`,
      { newChild },
    );
    return res.data;
  },

  removeChild: async (parent: string, child: string): Promise<void> => {
    await apiClient.delete(
      `/categories/${encodeURIComponent(parent)}/children/${encodeURIComponent(child)}`,
    );
  },

  reorderCategories: async (orderedParents: string[]): Promise<void> => {
    await apiClient.patch("/categories/reorder", { orderedParents });
  },
};
