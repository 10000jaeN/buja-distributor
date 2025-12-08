// ** Helper 함수: HttpOnly 쿠키 설정 **
const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true, // JS 접근 금지 (XSS 방어)
    secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 만료
    sameSite: "strict", // CSRF 방어
  });
};

export default setRefreshTokenCookie;
