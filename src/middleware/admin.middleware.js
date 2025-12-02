/**
 * 💡 관리자 미들웨어: req.user.roles에 'admin' 역할이 있는지 확인
 * 이 미들웨어는 반드시 authMiddleware 뒤에 위치해야 합니다.
 */
export const adminMiddleware = (req, res, next) => {
  // authMiddleware를 통해 req.user 객체가 존재함을 전제합니다.
  const userRoles = req.user.roles;

  // 1. roles 배열에 'admin'이 포함되어 있는지 확인
  if (!userRoles || !userRoles.includes("admin")) {
    const error = new Error(
      "접근 권한이 없습니다. 관리자만 이용할 수 있는 기능입니다."
    );
    error.status = 403; // Forbidden
    return next(error);
  }

  // 2. 관리자 권한이 확인되면 다음 미들웨어 또는 컨트롤러로 이동
  next();
};
