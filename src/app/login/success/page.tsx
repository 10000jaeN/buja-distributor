import { Suspense } from "react";
import LoginSuccessHandler from "./components/LoginSuccessHandler";

const LoginSuccess = () => {
  return (
    <>
      <h1 className="mt-20 flex justify-center text-[20px] font-bold">
        로그인 하는 중...
      </h1>
      <Suspense fallback={<div>로딩중...</div>}>
        <LoginSuccessHandler />
      </Suspense>
    </>
  );
};

export default LoginSuccess;
