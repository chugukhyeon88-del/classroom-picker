# 초등교사 학급 고르기

100만원을 모두 사용해 나만의 학급을 구성하는 예산 선택 게임입니다.

## 실행

```bash
npm install
cp .env.example .env.local   # Firebase·관리자 비밀번호 설정
npm run dev
```

## 사용 방법

1. **교사** (`/`): 바로 게임 진행 → 결과 화면에서 이름 입력 후 제출
2. **관리자** (`/admin`): 비밀번호 로그인 후 제출 목록 확인

### 환경 변수 (Vercel)

| 변수 | 용도 |
|------|------|
| `VITE_FIREBASE_*` | Firestore 제출 저장 |
| `VITE_ADMIN_PASSWORD` | 관리자 페이지 로그인 |

Firebase Console에서 Firestore를 만들고 `firestore.rules`를 게시하세요.

## 배포

```bash
npm run build
vercel --prod
```

## 스택

Vite · React · TypeScript · Tailwind CSS · Firebase Firestore
