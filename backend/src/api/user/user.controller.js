import User from "../../api/user/user.model.js";
import CustomError from "../../utils/customError.js"; // CustomError 클래스 임포트

// 쿠키 삭제 옵션 (재사용을 위해 별도 정의)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

/**
 * 💡 사용자 정보 조회 (GET /api/user/)
 * authMiddleware의 보호 하에 실행되며, req.user.id를 사용하여 해당 사용자의 정보를 조회합니다.
 */
export const getUserProfile = async (req, res) => {
  // 1. 인증된 사용자 ID
  const userId = req.user._id;

  // 2. DB에서 사용자 문서 조회 (CustomError를 던지므로 try-catch가 필요 없습니다.)
  const user = await User.findById(userId).select("-refreshToken -__v");

  if (!user) {
    // 사용자를 찾을 수 없는 경우 404 CustomError를 던집니다.
    throw new CustomError("사용자 정보를 찾을 수 없습니다.", 404);
  }

  // 3. 조회 성공 시 응답
  return res.status(200).json({
    message: "사용자 프로필 정보가 성공적으로 조회되었습니다.",
    data: user,
  });
};

/**
 * 💡 사용자 정보 수정 (PATCH /api/user/)
 * authMiddleware의 보호 하에 실행되며, req.user.id를 사용하여 해당 사용자의 정보를 수정합니다.
 */
export const patchUser = async (req, res) => {
  // 1. 인증된 사용자 ID
  const userIdToUpdate = req.user._id;

  // 2. 클라이언트로부터 받은 수정 데이터
  const updateData = req.body;

  // 3. 보안: 수정 불가능한 필드 제거 (민감한 필드 보호)
  const forbiddenFields = [
    "provider",
    "providerId",
    "roles",
    "refreshToken",
    "_id",
  ];
  forbiddenFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      delete updateData[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    // 수정할 내용이 없는 경우 400 Bad Request CustomError를 던집니다.
    throw new CustomError("수정할 내용이 없습니다.", 400);
  }

  // Mongoose의 findByIdAndUpdate를 사용하여 업데이트
  const updatedUser = await User.findByIdAndUpdate(userIdToUpdate, updateData, {
    new: true, // 업데이트된 문서를 반환하도록 설정
    runValidators: true, // 업데이트 시 스키마 유효성 검사 실행
    select: "-refreshToken", // 보안을 위해 Refresh Token은 응답에서 제외
  });

  if (!updatedUser) {
    // 사용자를 찾을 수 없는 경우 404 CustomError를 던집니다.
    throw new CustomError("수정할 사용자 계정을 찾을 수 없습니다.", 404);
  }

  // Mongoose Validation Error 처리 (catch 블록 대신 여기서 처리)
  // `findByIdAndUpdate`는 유효성 검사 실패 시 에러를 던집니다.
  if (updatedUser.errors) {
    // Mongoose Validation Error가 발생하면 400 CustomError로 변환하여 던집니다.
    throw new CustomError(
      `유효성 검사 오류: ${Object.keys(updatedUser.errors).join(", ")}`,
      400
    );
  }

  return res.status(200).json({
    message: "사용자 정보가 성공적으로 수정되었습니다.",
    data: updatedUser,
  });
};

/**
 * 💡 회원 탈퇴 (DELETE /api/user/delete)
 * authMiddleware의 보호 하에 실행되며, req.user.id를 사용하여 해당 사용자를 삭제합니다.
 */
export const deleteUser = async (req, res) => {
  // 미들웨어를 통해 인증된 사용자 ID
  const userIdToDelete = req.user._id;

  // 1. DB에서 사용자 문서 삭제
  const result = await User.findByIdAndDelete(userIdToDelete);

  // 2. 클라이언트 쿠키 삭제 (성공 여부와 상관없이 세션 종료 시도)
  res.clearCookie("refreshToken", cookieOptions);

  if (!result) {
    // 삭제할 사용자를 찾지 못한 경우 (이미 삭제되었을 가능성 포함) 404 CustomError를 던집니다.
    throw new CustomError(
      "삭제할 사용자 계정을 찾을 수 없거나 이미 삭제되었습니다.",
      404
    );
  }

  // 3. 삭제 성공 응답
  return res.status(200).json({
    message: "계정이 성공적으로 삭제(탈퇴)되었습니다.",
  });
};

/**
 * 💡 배송지 추가 (POST /api/user/address)
 */
export const addAddress = async (req, res) => {
  const userId = req.user._id;
  const { recipientName, phoneNumber, zipCode, mainAddress, detailAddress, jibunAddress, isDefault } = req.body;

  if (!recipientName || !phoneNumber || !zipCode || !mainAddress) {
    throw new CustomError("수령인, 전화번호, 우편번호, 주소는 필수입니다.", 400);
  }

  const user = await User.findById(userId).select("address");
  if (!user) throw new CustomError("사용자를 찾을 수 없습니다.", 404);
  if (user.address.length >= 10) throw new CustomError("배송지는 최대 10개까지 등록 가능합니다.", 400);

  // 첫 번째 배송지는 자동으로 기본 배송지
  const shouldBeDefault = isDefault || user.address.length === 0;

  let updatedUser;
  if (shouldBeDefault) {
    // isDefault 전체 false → 새 주소 추가(기본) 순서로 처리
    await User.findByIdAndUpdate(userId, { $set: { "address.$[].isDefault": false } });
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { address: { recipientName, phoneNumber, zipCode, mainAddress, detailAddress, jibunAddress, isDefault: true } } },
      { new: true, runValidators: true, select: "address" }
    );
  } else {
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { address: { recipientName, phoneNumber, zipCode, mainAddress, detailAddress, jibunAddress, isDefault: false } } },
      { new: true, runValidators: true, select: "address" }
    );
  }

  return res.status(201).json({ message: "배송지가 추가되었습니다.", data: updatedUser.address });
};

/**
 * 💡 배송지 수정 (PATCH /api/user/address/:addressId)
 */
export const updateAddress = async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;
  const { recipientName, phoneNumber, zipCode, mainAddress, detailAddress, jibunAddress } = req.body;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, "address._id": addressId },
    {
      $set: {
        ...(recipientName && { "address.$.recipientName": recipientName }),
        ...(phoneNumber && { "address.$.phoneNumber": phoneNumber }),
        ...(zipCode && { "address.$.zipCode": zipCode }),
        ...(mainAddress && { "address.$.mainAddress": mainAddress }),
        ...(detailAddress !== undefined && { "address.$.detailAddress": detailAddress }),
        ...(jibunAddress !== undefined && { "address.$.jibunAddress": jibunAddress }),
      },
    },
    { new: true, runValidators: true, select: "address" }
  );

  if (!updatedUser) throw new CustomError("배송지를 찾을 수 없습니다.", 404);

  return res.status(200).json({ message: "배송지가 수정되었습니다.", data: updatedUser.address });
};

/**
 * 💡 배송지 삭제 (DELETE /api/user/address/:addressId)
 * 기본 배송지 삭제 시 남은 첫 번째 배송지를 기본으로 설정
 */
export const deleteAddress = async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  const user = await User.findOne({ _id: userId, "address._id": addressId }).select("address");
  if (!user) throw new CustomError("배송지를 찾을 수 없습니다.", 404);

  const target = user.address.id(addressId);
  const wasDefault = target.isDefault;

  await User.findByIdAndUpdate(userId, { $pull: { address: { _id: addressId } } });

  // 기본 배송지를 삭제했을 경우 남은 첫 번째를 기본으로 설정
  if (wasDefault) {
    const updated = await User.findById(userId).select("address");
    if (updated.address.length > 0) {
      await User.findOneAndUpdate(
        { _id: userId, "address._id": updated.address[0]._id },
        { $set: { "address.$.isDefault": true } }
      );
    }
  }

  const result = await User.findById(userId).select("address");
  return res.status(200).json({ message: "배송지가 삭제되었습니다.", data: result.address });
};

/**
 * 💡 기본 배송지 설정 (PATCH /api/user/address/:addressId/default)
 * arrayFilters로 단일 연산 처리
 */
export const setDefaultAddress = async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  const user = await User.findOne({ _id: userId, "address._id": addressId });
  if (!user) throw new CustomError("배송지를 찾을 수 없습니다.", 404);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "address.$[other].isDefault": false,
        "address.$[target].isDefault": true,
      },
    },
    {
      arrayFilters: [
        { "other._id": { $ne: addressId } },
        { "target._id": addressId },
      ],
      new: true,
      select: "address",
    }
  );

  return res.status(200).json({ message: "기본 배송지가 설정되었습니다.", data: updatedUser.address });
};

/**
 * 💡 전체 사용자 목록 조회 (GET /api/user/admin/all)
 * adminAuthMiddleware의 보호 하에 실행되며, 관리자만 접근 가능합니다.
 * @access Private (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  // 1. (미들웨어에서 관리자 권한 확인이 완료되었다고 가정합니다.)

  // 2. DB에서 모든 사용자 문서 조회
  // 민감 정보(refreshToken, __v)는 응답에서 제외합니다.
  const users = await User.find().select("-refreshToken -__v");

  if (!users || users.length === 0) {
    // 사용자가 한 명도 없는 경우 (초기 설정 또는 오류)
    throw new CustomError("등록된 사용자 계정이 없습니다.", 404);
  }

  // 3. 조회 성공 시 응답
  return res.status(200).json({
    message: "전체 사용자 목록이 성공적으로 조회되었습니다.",
    count: users.length,
    data: users,
  });
};
