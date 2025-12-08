import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as NaverStrategy } from "passport-naver";
import { Strategy as KakaoStrategy } from "passport-kakao";

// --- 헬퍼 함수: Provider별 프로필 데이터 통일 ---
// 각 소셜 서비스에서 받은 프로필 객체를 DB에 저장할 User 객체 형태로 매핑합니다.
const mapProfileToUser = (provider, profile) => {
  let email = null;
  let nickName = null;

  switch (provider) {
    case "google":
      // Google: displayName을 닉네임으로 사용하고, emails 배열에서 이메일을 가져옵니다.
      email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;
      nickName = profile.displayName;
      break;
    case "naver":
      // Naver: _json 객체 안에 실제 사용자 정보가 있습니다.
      email = profile._json.email;
      // Naver는 nickname을 명시적으로 제공합니다.
      nickName = profile._json.nickname || profile._json.name;
      break;
    case "kakao":
      // Kakao: kakao_account 객체 안에 이메일과 properties 객체 안에 닉네임이 있습니다.
      // 이메일은 카카오톡 설정에 따라 제공 여부가 달라질 수 있습니다.
      email = profile._json.kakao_account.email || null;
      nickName = profile.displayName || profile._json.properties.nickname;
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  // 최종적으로 통일된 데이터 구조를 반환합니다.
  return {
    provider: provider,
    providerId: profile.id,
    email: email,
    // 닉네임이 없을 경우, provider와 ID의 일부를 조합하여 임시로 생성 (필수 필드 보장)
    nickName: nickName || `${provider}_${profile.id.slice(-4)}`,
  };
};

// --- Strategy 등록 ---
export const setupPassport = () => {
  // 1. Google Strategy 설정
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 통일된 객체를 생성하여 다음 단계(컨트롤러)로 전달합니다.
          const userProfile = mapProfileToUser("google", profile);
          return done(null, userProfile);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 2. Naver Strategy 설정
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: "/auth/naver/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userProfile = mapProfileToUser("naver", profile);
          return done(null, userProfile);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 3. Kakao Strategy 설정
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_REST_API_KEY,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userProfile = mapProfileToUser("kakao", profile);
          return done(null, userProfile);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Passport 직렬화/역직렬화 설정 (세션 미사용 시 필수 설정)
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    // 실제 DB에서 사용자를 찾아 반환하는 로직이 들어갈 수 있지만,
    // 토큰 기반 인증에서는 주로 사용자 객체 자체를 반환합니다.
    done(null, user);
  });
};
