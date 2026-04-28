# 📊 지수 밸류에이션 대시보드

S&P500, NASDAQ100, KOSPI200, CSI300의 현재 밸류에이션을 역사적 PER 범위와 비교하여 매수 타이밍을 판단하는 모바일 대시보드입니다.

## 주요 기능

- **4개 지수 PER 실시간 조회** (Yahoo Finance 기반)
- **신호등 시스템**: 저평가 / 적정 / 다소 고평가 / 고평가
- **역사적 평균 대비 위치 시각화** (밸류에이션 바)
- **종합 판단**: 전체 지수 상황 요약
- **모바일 최적화** UI

---

## 🚀 배포 방법 (GitHub + Vercel)

### 1단계: GitHub 레포지토리 생성

1. [github.com](https://github.com) 접속 → **New repository**
2. 이름 입력 (예: `valuation-dashboard`) → **Create repository**
3. 로컬에서 이 폴더를 업로드:

```bash
cd valuation-dashboard
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/valuation-dashboard.git
git push -u origin main
```

### 2단계: Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 계정으로 로그인
2. **Add New Project** → GitHub 레포 선택
3. Framework: **Next.js** (자동 감지)
4. **Deploy** 클릭

배포 완료 후 `https://your-project.vercel.app` 주소 생성됨

### 3단계: 스마트폰 홈 화면 추가

**iPhone**: Safari에서 열기 → 공유 → 홈 화면에 추가  
**Android**: Chrome에서 열기 → 메뉴 → 홈 화면에 추가

---

## 밸류에이션 판단 기준

| 지수 | 역사적 평균 PER | 저평가 기준 | 고평가 기준 |
|------|---------------|-----------|-----------|
| S&P 500 | 17x | 18x 이하 | 32x 이상 |
| NASDAQ 100 | 25x | 22x 이하 | 42x 이상 |
| KOSPI | 11x | 10x 이하 | 20x 이상 |
| CSI 300 | 13x | 12x 이하 | 25x 이상 |

---

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000 접속
```

---

## 데이터 출처

- Yahoo Finance (yahoo-finance2 패키지)
- PER: Trailing P/E 우선, 없을 경우 Forward P/E 사용
- 캐시: 1시간 (Vercel Edge Cache)

---

## ⚠️ 투자 유의사항

본 대시보드는 **투자 참고용**입니다.  
PER은 매수 타이밍의 하나의 참고 지표일 뿐이며, 실제 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.

> 고평가 = 곧 하락이 아니라, **고평가 = 리스크가 높아진 상태**로 해석하세요.
