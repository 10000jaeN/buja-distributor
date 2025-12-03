// error.middleware.js

/**
 * 전역 오류 처리 미들웨어입니다.
 * CustomError 객체를 포함하여 모든 오류를 포착하고 표준화된 JSON 응답을 전송합니다.
 *
 * @param {Error} err - 잡힌 오류 객체 (CustomError 또는 기본 Error)
 * @param {import('express').Request} req - Express 요청 객체
 * @param {import('express').Response} res - Express 응답 객체
 * @param {import('express').NextFunction} next - 다음 미들웨어로 넘어가는 함수 (사용되지 않음)
 */
const globalErrorHandler = (err, req, res, next) => {
  // 1. 기본 상태 코드 및 메시지 설정 (대부분의 오류는 500으로 처리)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // 2. 운영 오류(CustomError)와 프로그래밍 오류(기본 Error) 구분
  if (err.isOperational) {
    // 💡 운영 오류: 클라이언트에게 오류 정보를 안전하게 공개
    // CustomError를 통해 정의된 상태 코드와 메시지 사용
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // 3. 프로그래밍 또는 알 수 없는 심각한 오류 (500)
  // 💡 심각한 오류: 오류 정보를 클라이언트에게 노출하지 않고, 서버 로그에 기록
  console.error("CRITICAL ERROR 💥", err);

  return res.status(500).json({
    status: "error",
    message:
      "예상치 못한 심각한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  });
};

export default globalErrorHandler;
