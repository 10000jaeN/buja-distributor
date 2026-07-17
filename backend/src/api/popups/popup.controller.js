import Popup from "./popup.model.js";
import CustomError from "../../utils/customError.js";
import mongoose from "mongoose";

// GET /popups/active — 공개: 현재 노출 중인 팝업 목록
export const getActivePopups = async (req, res) => {
  const now = new Date();
  const popups = await Popup.find({
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  }).sort({ createdAt: -1 });
  res.json(popups);
};

// GET /popups — 어드민: 전체 목록
export const getAllPopups = async (req, res) => {
  const popups = await Popup.find({}).sort({ createdAt: -1 });
  res.json(popups);
};

// POST /popups — 어드민: 팝업 생성
export const createPopup = async (req, res) => {
  const { title, imageUrl, linkUrl, couponCode, isActive, startDate, endDate } = req.body;

  if (!title || !imageUrl) {
    throw new CustomError("title과 imageUrl은 필수입니다.", 400);
  }

  const popup = await Popup.create({
    title,
    imageUrl,
    linkUrl: linkUrl || null,
    couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
    isActive: isActive ?? true,
    startDate: startDate || null,
    endDate: endDate || null,
  });

  res.status(201).json(popup);
};

// PATCH /popups/:id — 어드민: 팝업 수정
export const updatePopup = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  const { title, imageUrl, linkUrl, couponCode, isActive, startDate, endDate } = req.body;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (linkUrl !== undefined) updateData.linkUrl = linkUrl || null;
  if (couponCode !== undefined) updateData.couponCode = couponCode ? couponCode.toUpperCase().trim() : null;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (startDate !== undefined) updateData.startDate = startDate || null;
  if (endDate !== undefined) updateData.endDate = endDate || null;

  const popup = await Popup.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!popup) throw new CustomError("팝업을 찾을 수 없습니다.", 404);

  res.json(popup);
};

// DELETE /popups/:id — 어드민: 팝업 삭제
export const deletePopup = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  const popup = await Popup.findByIdAndDelete(id);
  if (!popup) throw new CustomError("팝업을 찾을 수 없습니다.", 404);

  res.json({ message: "팝업이 삭제되었습니다." });
};
