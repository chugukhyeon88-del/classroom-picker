# 초등교사 학급 고르기

100만원을 모두 사용해 나만의 학급을 구성하는 예산 선택 게임입니다.

## 실행

```bash
npm install
cp .env.example .env.local   # Firebase·관리자 비밀번호 설정
npm run dev
```

## 제출 · 관리 기능

1. **관리자** (`/admin`): 비밀번호로 로그인 → 활동 생성 → 교사용 코드·링크 공유
2. **교사** (`/?code=ABC123`): 활동 코드로 참여 → 게임 완료 후 이름 입력 → 제출
3. **관리자**는 활동 코드 + 관리 토큰으로 제출 목록 조회

### 환경 변수 (Vercel)

| 변수 | 용도 |
|------|------|
| `VITE_FIREBASE_*` | Firestore 제출 저장 |
| `VITE_ADMIN_PASSWORD` | 관리자 페이지 로그인 |

Firebase Console에서 `firestore.rules`를 배포하세요.

## 배포

```bash
npm run build
vercel --prod
```

## 스택

Vite · React · TypeScript · Tailwind CSS · Firebase Firestore
