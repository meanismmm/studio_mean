# studio_mean

OpenAI 기반 블로그 원고 작성 도구입니다. 정신건강의학과 블로그의 기존 문단 구조, 톤앤매너, 금지 표현, 의학적 정확성 원칙을 유지하면서 `gpt-5.6-sol`로 초안을 작성하고 한 차례 편집·검수합니다. 온라인 배포판의 API 키는 서버 비밀 설정에만 보관됩니다.

## 실행

필수 조건:

- Node.js 18 이상
- 상위 폴더 또는 이 프로젝트 폴더의 `.env`에 `OPENAI_API_KEY` 설정

PowerShell에서 실행:

```powershell
npm.cmd start
```

Windows에서는 `start_studio_mean.cmd`를 더블클릭해도 됩니다. 서버가 켜진 뒤 브라우저가 자동으로 열립니다.

브라우저에서 다음 주소를 엽니다.

```text
http://127.0.0.1:8787
```

서버는 프로젝트 폴더부터 상위 폴더 방향으로 가장 가까운 `.env`를 찾아 읽습니다. API 키는 브라우저로 전달하지 않습니다.

## 배포

`npm run build`가 정적 화면과 서버 실행 파일을 `dist`에 생성합니다. 배포 환경에는 `OPENAI_API_KEY`를 비밀 값으로 설정해야 합니다.

## 환경변수

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-sol
PORT=8787
```

실제 `.env`는 Git에 포함되지 않습니다.

## 글 작성 흐름

정신건강의학과 블로그는 다음 순서로 처리합니다.

1. 독자 조건에 맞는 주제 추천
2. 기존 작성 원칙을 적용한 초안 생성
3. 동일 원칙에 따른 최종 편집·검수
4. 마크다운 기호 정리 후 결과 표시

글 작성 원칙의 활성 원본은 `js/blog.js`의 `PSYCH_SYSTEM`입니다.

## 점검

```powershell
npm.cmd run check
```

GitHub Pages처럼 정적 파일만 제공하는 환경에서는 OpenAI 호출이 작동하지 않습니다. API 키를 보호하기 위해 반드시 `server.js`를 함께 실행해야 합니다.
