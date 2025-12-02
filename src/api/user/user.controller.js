import User from "../../api/user/user.model.js";

// 쿠키 삭제 옵션
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
  const userId = req.user.id;

  try {
    // 2. DB에서 사용자 문서 조회
    // select('-refreshToken')는 스키마 레벨에서 이미 설정되어 있지만,
    // 명시적으로 안전한 필드만 선택하거나 제외 필드를 다시 확인하는 것이 좋습니다.
    const user = await User.findById(userId).select("-refreshToken -__v");

    if (!user) {
      return res
        .status(404)
        .json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 3. 조회 성공 시 응답
    return res.status(200).json({
      message: "사용자 프로필 정보가 성공적으로 조회되었습니다.",
      data: user,
    });
  } catch (error) {
    console.error("User Profile Fetch Error:", error.message);
    return res
      .status(500)
      .json({ message: "사용자 정보 조회 중 서버 오류가 발생했습니다." });
  }
};

/**
 * 💡 사용자 정보 수정 (PATCH /api/user/)
 * authMiddleware의 보호 하에 실행되며, req.user.id를 사용하여 해당 사용자의 정보를 수정합니다.
 */
export const patchUser = async (req, res) => {
  // 1. 인증된 사용자 ID
  const userIdToUpdate = req.user.id;

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
    return res.status(400).json({ message: "수정할 내용이 없습니다." });
  }

  try {
    // Mongoose의 findByIdAndUpdate를 사용하여 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      userIdToUpdate,
      updateData,
      {
        new: true, // 업데이트된 문서를 반환하도록 설정
        runValidators: true, // 업데이트 시 스키마 유효성 검사 실행
        select: "-refreshToken", // 보안을 위해 Refresh Token은 응답에서 제외
      }
    );

    if (!updatedUser) {
      // authMiddleware를 거쳤기 때문에 404는 흔하지 않으나, 혹시 모를 경우를 대비
      return res
        .status(404)
        .json({ message: "수정할 사용자 계정을 찾을 수 없습니다." });
    }

    return res.status(200).json({
      message: "사용자 정보가 성공적으로 수정되었습니다.",
      data: updatedUser,
    });
  } catch (error) {
    // 유효성 검사 오류 (예: 스키마에 정의되지 않은 필드) 또는 DB 오류 처리
    console.error("User Update Error:", error.message);

    // Mongoose Validation Error 처리
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, details: error.errors });
    }

    return res
      .status(500)
      .json({ message: "사용자 정보 수정 중 서버 오류가 발생했습니다." });
  }
};

/**
 * 💡 회원 탈퇴 (DELETE /api/user/delete)
 * authMiddleware의 보호 하에 실행되며, req.user.id를 사용하여 해당 사용자를 삭제합니다.
 */
export const deleteUser = async (req, res) => {
  // 미들웨어를 통해 인증된 사용자 ID
  const userIdToDelete = req.user.id;

  try {
    // 1. DB에서 사용자 문서 삭제
    const result = await User.findByIdAndDelete(userIdToDelete);

    if (!result) {
      // DB에서 사용자를 찾지 못했더라도, 쿠키는 삭제해야 합니다. (세션 강제 종료)
      res.clearCookie("refreshToken", cookieOptions);
      return res.status(404).json({
        message: "삭제할 사용자 계정을 찾을 수 없거나 이미 삭제되었습니다.",
      });
    }

    // 2. 클라이언트 쿠키 삭제 (세션 종료)
    res.clearCookie("refreshToken", cookieOptions);

    // 3. (선택적) OAuth 연결 해제 로직을 여기에 추가할 수 있습니다.

    return res.status(200).json({
      message: "계정이 성공적으로 삭제(탈퇴)되었습니다.",
    });
  } catch (error) {
    console.error("User Deletion Error:", error.message);
    // 서버 오류 발생 시에도 쿠키는 안전하게 삭제하는 것이 좋습니다.
    res.clearCookie("refreshToken", cookieOptions);
    return res
      .status(500)
      .json({ message: "계정 삭제 중 서버 오류가 발생했습니다." });
  }
};
