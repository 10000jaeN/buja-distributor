// 비동기 라우트 핸들러의 try...catch 반복을 제거하기 위한 래퍼 함수입니다.

/**
 * Express 라우터 핸들러 (async function)를 받아
 * 에러 발생 시 next(error)로 중앙 에러 핸들러에 전달하는 새로운 핸들러를 반환합니다.
 * * @param {Function} fn - 비동기 Express 라우트 핸들러 (req, res, next) => Promise
 * @returns {Function} - Express가 사용할 수 있는 에러 처리 미들웨어
 */
const asyncHandler = (fn) => (req, res, next) => {
  // 1. 전달받은 비동기 함수(fn)를 실행합니다.
  Promise.resolve(fn(req, res, next))
    // 2. 만약 Promise가 reject 되거나 throw 되는 에러가 있다면 catch 블록으로 잡습니다.
    .catch(next); // 3. 잡은 에러를 Express의 중앙 에러 핸들러로 전달합니다.
};

export default asyncHandler;
