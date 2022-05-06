import passport from 'passport'
import { OAuth2Strategy as googleStrategy } from 'passport-google-oauth'
import { Strategy as naverStrategy } from 'passport-naver'
import { Strategy as kakaoStrategy } from 'passport-kakao'
import { IspType, UserRole } from '../types/user'

const configureOAuth = () => {
  passport.use(
    'google-hospital',
    new googleStrategy(
      {
        clientID: process.env.OAUTH_GOOGLE_CLIENT_ID!,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/google/hospital/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        console.log('profile', profile._json)
        const { email, name, picture, sub } = profile._json
        return done(null, {
          name,
          email,
          profileImage: picture,
          role: UserRole.CLIENT,
          isp: IspType.GOOGLE,
          ispId: sub,
          redirectURL: process.env.HOSPITAL_URL,
        })
      },
    ),
  )

  passport.use(
    'google-agency',
    new googleStrategy(
      {
        clientID: process.env.OAUTH_GOOGLE_CLIENT_ID!,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/google/agency/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        const { email, name, picture: profileImage, sub: ispId } = profile._json
        console.log('------google-agency-----', {
          name,
          email,
          profileImage,
          role: UserRole.AGENCY,
          isp: IspType.GOOGLE,
          ispId,
          redirectURL: process.env.AGENCY_URL,
        })
        return done(null, {
          name,
          email,
          profileImage,
          role: UserRole.AGENCY,
          isp: IspType.GOOGLE,
          ispId,
          redirectURL: process.env.AGENCY_URL,
        })
      },
    ),
  )

  passport.use(
    'naver-agency',
    new naverStrategy(
      {
        clientID: process.env.OAUTH_NAVER_CLIENT_ID!,
        clientSecret: process.env.OAUTH_NAVER_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/naver/agency/callback`,
      },
      async (_, __, profile, done) => {
        const { email, nickname: name, profile_image: profileImage, id: ispId } = profile._json
        return done(null, {
          email,
          name,
          profileImage,
          role: UserRole.AGENCY,
          isp: IspType.NAVER,
          ispId: String(ispId),
          redirectURL: process.env.AGENCY_URL,
        })
      },
    ),
  )

  passport.use(
    'naver-hospital',
    new naverStrategy(
      {
        clientID: process.env.OAUTH_NAVER_CLIENT_ID!,
        clientSecret: process.env.OAUTH_NAVER_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/naver/hospital/callback`,
      },
      async (_, __, profile, done) => {
        const { email, nickname: name, profile_image: profileImage, id: ispId } = profile._json
        return done(null, {
          email,
          name,
          profileImage,
          role: UserRole.CLIENT,
          isp: IspType.NAVER,
          ispId: String(ispId),
          redirectURL: process.env.HOSPITAL_URL,
        })
      },
    ),
  )

  passport.use(
    'kakao-hospital',
    new kakaoStrategy(
      {
        clientID: process.env.OAUTH_KAKAO_CLIENT_ID!,
        clientSecret: process.env.OAUTH_KAKAO_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/kakao/hospital/callback`,
      },
      async (_, __, profile, done) => {
        const { properties, kakao_account, id: ispId } = profile._json
        return done(null, {
          email: kakao_account.email,
          name: properties.nickname,
          profileImage: properties.profile_image,
          role: UserRole.CLIENT,
          isp: IspType.KAKAO,
          ispId: String(ispId),
          redirectURL: process.env.HOSPITAL_URL,
        })
      },
    ),
  )

  passport.use(
    'kakao-agency',
    new kakaoStrategy(
      {
        clientID: process.env.OAUTH_KAKAO_CLIENT_ID!,
        clientSecret: process.env.OAUTH_KAKAO_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/kakao/agency/callback`,
      },
      async (_, __, profile, done) => {
        const { properties, kakao_account, id: ispId } = profile._json
        return done(null, {
          email: kakao_account.email,
          name: properties.nickname,
          profileImage: properties.profile_image,
          role: UserRole.AGENCY,
          isp: IspType.KAKAO,
          ispId: String(ispId),
          redirectURL: process.env.AGENCY_URL,
        })
      },
    ),
  )
}

export default configureOAuth

// https://console.cloud.google.com/apis/credentials
// google
// {
//   sub: '104299332587735552857',
//   name: 'Mobum Shin',
//   given_name: 'Mobum',
//   family_name: 'Shin',
//   picture: 'https://lh3.googleusercontent.com/a-/AOh14Gj5dKxQMkKnza2papuZSoRYCHsDR27hpi-24RAZhQ=s96-c',
//   email: 'jhylmb@gmail.com',
//   email_verified: true,
//   locale: 'ko'
// }
