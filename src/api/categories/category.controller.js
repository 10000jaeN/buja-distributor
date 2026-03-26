import Category from "./category.model.js";
import CustomError from "../../utils/customError.js";

/**
 * GET /categories - 카테고리 전체 목록 조회
 */
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ parent: 1 });
  return res.status(200).json({ data: categories });
};

/**
 * POST /categories - 카테고리 생성 (관리자 전용)
 * body: { parent: string, children?: string[] }
 */
export const createCategory = async (req, res) => {
  const { parent, children = [] } = req.body;

  if (!parent) {
    throw new CustomError("parent는 필수 항목입니다.", 400);
  }

  const category = await Category.create({ parent, children });
  return res.status(201).json({ data: category });
};

/**
 * PATCH /categories/:parent - 카테고리 수정 (관리자 전용)
 * body: { newParent?: string, children?: string[] }
 */
export const updateCategory = async (req, res) => {
  const { parent } = req.params;
  const { newParent, children } = req.body;

  const updateData = {};
  if (newParent) updateData.parent = newParent;
  if (children !== undefined) updateData.children = children;

  const updated = await Category.findOneAndUpdate(
    { parent },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new CustomError(`카테고리 '${parent}'를 찾을 수 없습니다.`, 404);
  }

  return res.status(200).json({ data: updated });
};

/**
 * DELETE /categories/:parent - 카테고리 삭제 (관리자 전용)
 */
export const deleteCategory = async (req, res) => {
  const { parent } = req.params;

  const deleted = await Category.findOneAndDelete({ parent });

  if (!deleted) {
    throw new CustomError(`카테고리 '${parent}'를 찾을 수 없습니다.`, 404);
  }

  return res.sendStatus(204);
};

/**
 * POST /categories/:parent/children - 소분류 추가 (관리자 전용)
 * body: { child: string }
 */
export const addChild = async (req, res) => {
  const { parent } = req.params;
  const { child } = req.body;

  if (!child) {
    throw new CustomError("child는 필수 항목입니다.", 400);
  }

  const updated = await Category.findOneAndUpdate(
    { parent },
    { $addToSet: { children: child } },
    { new: true }
  );

  if (!updated) {
    throw new CustomError(`카테고리 '${parent}'를 찾을 수 없습니다.`, 404);
  }

  return res.status(200).json({ data: updated });
};

/**
 * PATCH /categories/:parent/children/:child - 소분류 수정 (관리자 전용)
 * body: { newChild: string }
 */
export const updateChild = async (req, res) => {
  const { parent, child } = req.params;
  const { newChild } = req.body;

  if (!newChild) {
    throw new CustomError("newChild는 필수 항목입니다.", 400);
  }

  const updated = await Category.findOneAndUpdate(
    { parent, children: decodeURIComponent(child) },
    { $set: { "children.$": newChild } },
    { new: true }
  );

  if (!updated) {
    throw new CustomError(`'${parent} > ${child}'를 찾을 수 없습니다.`, 404);
  }

  return res.status(200).json({ data: updated });
};

/**
 * DELETE /categories/:parent/children/:child - 소분류 삭제 (관리자 전용)
 */
export const removeChild = async (req, res) => {
  const { parent, child } = req.params;

  const updated = await Category.findOneAndUpdate(
    { parent },
    { $pull: { children: decodeURIComponent(child) } },
    { new: true }
  );

  if (!updated) {
    throw new CustomError(`카테고리 '${parent}'를 찾을 수 없습니다.`, 404);
  }

  return res.status(200).json({ data: updated });
};
