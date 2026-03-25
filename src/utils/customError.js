// Express 중앙 에러 핸들러와 함께 사용할 커스텀 에러 클래스입니다.

class CustomError extends Error {
  /**
   * @param {string} message - 에러 메시지
   * @param {number} statusCode - HTTP 상태 코드 (예: 400, 404)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // 💡 'status' 대신 'errorType' 혹은 'result' 같은 이름을 사용하세요.
    // 익스프레스 에러 핸들러가 err.status를 숫자로 오해하는 것을 방지합니다.
    this.errorType = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // 💡 운영 오류(Operational Error)로 플래그를 지정합니다.
    // error.middleware.js가 이 속성을 사용하여 클라이언트에게 메시지를 공개합니다.
    this.isOperational = true;

    // 이 생성자 함수 호출을 스택 트레이스에서 제외합니다.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export default CustomError;
