import User from "../../api/user/user.model.js"; // user.model.js 경로 수정

// 쿠키 삭제 옵션
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
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
