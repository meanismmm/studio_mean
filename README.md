# Studio Mean

부가 수익 자동화 콘텐츠 스튜디오 — GitHub Pages 기반 웹앱

## 기능

| 탭 | 기능 |
|----|------|
| 🛒 쿠팡 숏츠 | 쿠팡 파트너스 상품 조회 → PAIN/WOW형 스크립트 생성 → TTS 나레이션 |
| 🌌 스토리텔링 | 음모론·우주·미스터리 주제 추천 → 한/영 스크립트 생성 |
| 🧠 퀴즈 숏츠 | 퀴즈 생성 → GitHub Actions로 mp4 자동 렌더링 |
| 🏥 정신과 블로그 | 네이버 블로그 포스팅 생성 + Pexels 이미지 추천 |
| ✍️ 티스토리 | 개인 블로그 포스팅 생성 |

## 설치 및 배포

### 1. 레포지토리 생성
`meanismmm/studio_mean` 으로 Public 레포지토리를 생성합니다.

### 2. 파일 업로드
이 폴더의 모든 파일을 레포지토리에 업로드합니다.

### 3. GitHub Pages 활성화
Settings → Pages → Source: `main` 브랜치 → `/ (root)` → Save

### 4. GitHub Secrets 설정 (퀴즈 영상 렌더링용)
Settings → Secrets and variables → Actions → New repository secret

| 이름 | 값 |
|------|-----|
| `GCP_TTS_KEY` | Google Cloud TTS API 키 |

### 5. 웹앱 접속
`https://meanismmm.github.io/studio_mean/` 접속 후 설정 탭에서 API 키 입력

## API 키 설정 (웹앱 설정 탭)

| 키 | 필수 여부 | 용도 |
|----|-----------|------|
| Claude API Key | ✅ 필수 | 모든 콘텐츠 생성 |
| Google Cloud TTS | 선택 | 나레이션 음성 생성 |
| 쿠팡 Access/Secret | 선택 | 상품 자동 조회 |
| Pexels API Key | 선택 | 블로그 이미지 추천 |
| GitHub Token | 선택 | 퀴즈 영상 렌더링 트리거 |

## 퀴즈 영상 렌더링 방법

1. 퀴즈 숏츠 탭 → 퀴즈 생성
2. "GitHub Actions 트리거" 클릭
3. `https://github.com/meanismmm/studio_mean/actions` 에서 진행 확인
4. 완료 후 Artifacts에서 `quiz_video.mp4` 다운로드 (7일 보관)

## 기술 스택

- HTML + Vanilla JS (서버 없음)
- GitHub Pages (정적 호스팅)
- GitHub Actions + FFmpeg + Python PIL (영상 렌더링)
- Claude API, Google Cloud TTS, Pexels API, 쿠팡 파트너스 API
