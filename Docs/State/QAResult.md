---
title: Wabi QA 실행 결과
description: QAPlan.md 시나리오를 Front-end 구현체(로컬 dev 서버)에 대해 실제로 실행한 결과. 2026-08-28 실행분.
---

## 0. 실행 환경

- 대상: `npm run dev`로 띄운 로컬 서버(`http://localhost:3000`), Front-end 구현 완료 · `npm run build` / `typecheck` 통과 상태 기준.
- 브라우저: sudo 없이 `apt-get download`로 받은 `libnspr4`/`libnss3`/`libasound2t64` deb 3개를 `dpkg -x`로 스크래치 디렉터리에 풀고 `LD_LIBRARY_PATH`로 연결해, `~/.cache/ms-playwright`에 이미 설치돼 있던 Chromium을 headless로 구동했다. 구동 자체는 문제없이 됐다(`--headless=new --dump-dom` 스모크 테스트 통과).
- 자동화: 프로젝트에는 브라우저 자동화 도구가 없어 스크래치 디렉터리에 `playwright-core`만 별도로 `npm install`하고, 위 캐시된 Chromium을 `executablePath`로 직접 지정해 구동했다(프로젝트 의존성에는 손대지 않음).
- 뷰포트: 390×844(모바일) 고정. 사용자 지시로 **21절 반응형·PC 화면 시나리오는 이번 실행 범위에서 제외**했다(QAPlan.md 21절 제목 옆에 보류 표시만 남기고 절 자체는 삭제하지 않았다).
- 실행 순서: 19절(빈 상태) → 20절(출국일 입력) → 23절(출처 표시) · 12절(완료 항목) · 13절(긴급 alert), 지시받은 우선순위 그대로.
- 헤드리스 구동에 쓴 deb 추출 사본과 `qa-driver`(playwright-core, 테스트 스크립트)는 **작업 종료 시 모두 삭제**한다(5절 참고).

---

## 1. 결함 (심각도순)

### D-1. [심각: 높음 → **해결됨**] D-day 계산이 UTC보다 느린 시간대에서 하루 적게 표시됨

- **위치**: `src/Front/app-shell/state/wabiLogic.ts`의 `computeDDay`
- **재현**: 실제 서버에 대해 브라우저 타임존을 `America/Vancouver`, `America/Toronto`로 설정하고 출국일을 `2026-09-09`로 입력하면, 그 시간대의 실제 로컬 오늘 날짜 기준 정답은 D-13인데 화면에는 **D-12**로 표시된다(하루 적게, 모든 시각에서 일관되게 재현). `Asia/Seoul`과 `UTC`에서는 재현되지 않는다.
- **근거**: 순수 함수 레벨(Node, `TZ` 환경변수 조작)과 실제 앱(Playwright `context.newContext({ timezoneId })`) 양쪽에서 교차 검증했다.

  | TZ | 입력 출국일 | 실제 로컬 오늘 | 정답 D-day | 화면 표시 |
  |---|---|---|---|---|
  | America/Vancouver | 2026-09-09 | 2026-08-27 | D-13 | **D-12** |
  | America/Toronto | 2026-09-09 | 2026-08-27 | D-13 | **D-12** |
  | Asia/Seoul | 2026-09-09 | 2026-08-28 | D-12 | D-12 (정상) |
  | UTC | 2026-09-09 | 2026-08-28 | D-12 | D-12 (정상) |

- **원인**: `new Date("2026-09-09")` 같은 날짜 전용 ISO 문자열은 UTC 자정으로 파싱된다. 음수 UTC 오프셋 시간대에서는 이 UTC 자정이 로컬 달력으로 하루 전날에 해당하는데, 뒤이은 `target.setHours(0,0,0,0)`이 "이미 하루 전날로 밀린" 로컬 날짜를 기준으로 자정을 맞추면서 출국일 자체가 로컬 기준 하루 당겨진 채로 오늘과의 차이 계산에 들어간다.
- **영향 범위**: 이 앱이 지원하는 3개국 중 캐나다는 전체 시간대가 UTC-3:30~UTC-8로 전부 음수 오프셋이다. 캐나다에 도착해 "현지 정착" 단계에 들어간 이용자는 기기 시간대가 캐나다 지역으로 바뀌는 순간부터 D-day가 항상 하루 적게 표시된다. 원 개발/QA 환경(Asia/Seoul)에서는 재현되지 않아 사전에 드러나지 않았을 가능성이 높다.
- **상태**: PM에게 즉시 보고 완료 → PM이 직접 재현 확인 → Frontend가 D-2와 함께 수정(아래 2절 참고) → **QA가 수정된 빌드로 재검증 완료, 해결 확인**.

### D-2. [심각: 높음 → **해결됨**] `formatKoreanDate`가 UTC보다 느린 시간대에서 출국일·비자 만료일 표시 자체를 하루 앞당겨 보여줌

- **위치**: `src/Front/app-shell/state/wabiLogic.ts`의 `formatKoreanDate`
- **재현**: `America/Toronto`에서 출국일을 `2026-09-09`로 입력하면, 나 화면에 다음과 같이 표시된다(실제 서버·실제 앱에서 재현 확인).

  | TZ | 나 화면 출국일 표시 | 나 화면 비자 만료일 표시 |
  |---|---|---|
  | Asia/Seoul | 2026년 9월 9일 출국 (정상) | 비자 만료 2027년 9월 9일 (정상) |
  | America/Toronto | **2026년 9월 8일 출국** | **비자 만료 2027년 9월 8일** |

- **원인**: D-1과 같은 패턴이다. `new Date(iso)`로 파싱한 UTC 자정 인스턴트에서 `setHours` 정규화 없이 바로 `getFullYear()/getMonth()/getDate()` 같은 로컬 getter로 연·월·일을 읽기 때문에, 음수 오프셋 시간대에서는 항상 하루 이른 로컬 날짜가 나온다.
- **비고**: `computeVisaExpiry`는 파싱(UTC 자정)과 최종 출력(`toISOString().slice(0,10)`)이 둘 다 UTC 기준이라 결과 자체(ISO 문자열)는 시간대와 무관하게 항상 정확하다 — **다만 그 정확한 ISO 값을 화면에 보여주는 `formatKoreanDate`가 이 버그를 갖고 있어, 계산은 맞는데 표시만 틀리는 상황**이다.
- **영향**: 사용자가 실제로 눈으로 확인하는 "출국일"·"비자 만료일" 문자열 자체가 틀리게 나온다는 점에서 D-1(카운터 숫자)보다 체감상 더 눈에 띄는 결함이다. discussion.md 13절이 "출처 표시" 기능의 동기로 든 "비자·세금·보험처럼 틀리면 이용자가 실제로 손해를 보는 정보"에 정확히 해당하는 값(비자 만료일)이 틀리게 표시된다는 점에서 실질적 피해 가능성이 크다.
- **상태**: PM이 직접 재현해 확인 → Frontend가 D-1과 함께 수정 → **QA가 수정된 빌드로 재검증 완료, 해결 확인**.

두 결함 모두 원인 패턴이 같았다(날짜 전용 ISO 문자열을 UTC로 파싱한 뒤 로컬 getter/setter로 다루는 것). 세 번째 관련 함수 `computeVisaExpiry`도 지금까지는 우연히 결과가 맞았을 뿐 같은 패턴을 쓰고 있었기 때문에 함께 고쳐졌다(아래 2절 참고).

---

## 2. 재검증 (D-1 · D-2, 2026-08-28)

Front-end가 `wabiLogic.ts`에 `parseLocalDateOnly`/`formatDateOnly` 헬퍼를 추가해 `computeDDay`·`computeVisaExpiry`·`formatKoreanDate` 세 함수를 모두 로컬 자정 기준으로 통일했고, `npm run test:wabi-logic` 회귀 테스트(Asia/Seoul · UTC · America/Toronto 세 시간대에서 같은 값이 나오는지 확인)를 추가했다고 전달받았다. QA가 두 단계로 독립 재검증했다.

### (1) 단위 회귀 테스트

```
npm run test:wabi-logic
```

Asia/Seoul, UTC, America/Toronto 세 시간대 모두에서 `computeDDay`/`formatDDay`/`computeVisaExpiry`/`formatKoreanDate`/`pickNextTask`/`firstSentence` 전 항목이 `ok`로 통과했다(마지막 줄: `PASS: 세 시간대 모두에서 wabiLogic 날짜 함수 결과가 일치합니다.`).

### (2) 화면 단위 재검증 (헤드리스 브라우저, 실제 서버)

이전과 같은 방식으로 임시 headless Chromium 환경(`dpkg -x`로 sudo 없이 `libnspr4`/`libnss3`/`libasound2t64` 로컬 추출 + `LD_LIBRARY_PATH`, 스크래치 디렉터리에 `playwright-core` 별도 설치)을 다시 구성해, `context.newContext({ timezoneId })`로 브라우저 타임존을 `Asia/Seoul`과 `America/Toronto`로 바꿔가며 같은 출국일(`2026-09-09`, AU 국가)을 입력하고 홈 D-day와 나 화면 출국일·비자 만료일 표시를 비교했다.

| 항목 | Asia/Seoul | America/Toronto | 판정 |
|---|---|---|---|
| 실제 로컬 오늘 | 2026-08-28 | 2026-08-27 | (참고: 시간대가 다르므로 실행 시점의 로컬 날짜 자체가 다름) |
| 홈 D-day | D-12 | D-13 | 각 시간대의 실제 로컬 오늘 기준 정답과 정확히 일치(**서로 값이 다른 것이 정상** — "오늘"이 시간대마다 다른 달력 날짜이므로 D-day도 마땅히 달라야 한다) |
| 나 화면 출국일 표시 | 2026년 9월 9일 출국 | 2026년 9월 9일 출국 | **완전히 동일** — 고정된 날짜라 시간대와 무관해야 하며, 실제로 무관하게 나옴(수정 전에는 Toronto에서 "9월 8일"로 하루 밀렸었음) |
| 나 화면 비자 만료일 표시 | 비자 만료 2027년 9월 9일 | 비자 만료 2027년 9월 9일 | **완전히 동일**(수정 전 Toronto "2027년 9월 8일"에서 정정됨) |
| 콘솔 에러 | 0건 | 0건 | 정상 |

D-day는 "오늘"을 참조하는 값이라 시간대마다 로컬 오늘이 다르면 값도 달라지는 것이 올바른 동작이고, 각 시간대에서 그 시간대의 실제 로컬 오늘을 별도로 구해 기대값과 대조한 결과 두 시간대 모두 정확히 일치했다. 반대로 출국일·비자 만료일처럼 "오늘"과 무관한 고정 날짜는 시간대가 달라도 표시가 완전히 동일해야 하는데, 실제로 완전히 동일하게 나와 D-2(`formatKoreanDate`)가 해결되었음을 확인했다.

**결론: D-1, D-2 모두 해결 확인.** 사용 후 헤드리스 브라우저용 임시 라이브러리 사본과 드라이버는 다시 삭제했다.

---

## 3. 통과한 시나리오

모바일 폭(390×844), Asia/Seoul 기준으로 아래 항목 모두 실제 앱에서 통과했다(총 33건).

### 20절 — 출국일 입력

| ID | 결과 | 확인 내용 |
|---|---|---|
| DAY-01 | PASS | 미입력 상태에서 나 화면 출국일 행이 "입력하기"로 표시 |
| DAY-04 | PASS | 미입력 상태에서 홈 D-day 자리가 빈 상태 문구로 표시 |
| DAY-05 | PASS | 미입력 상태에서 나 화면 출국일·비자만료 두 줄 모두 빈 상태 문구로 표시 |
| DAY-06 | PASS | 출국 12일 전 → "D-12" 정확히 표시(Asia/Seoul) |
| DAY-07 | PASS | 출국 당일 → "D-DAY" 표시 |
| DAY-08 | PASS | 출국 3일 경과 → "D+3" 표시 |
| DAY-09 | PASS | 출국 1일 경과(어제) 경계값 → "D+1" 표시 |
| DAY-10 | PASS | AU(체류 365일) 비자 만료일 정확히 계산·표시(Asia/Seoul) |
| DAY-12 | PASS | 국가 변경(AU→CA→JP) 시 출국일 유지, 비자 만료일이 각 국가 체류기간(730일/365일)으로 재계산 |
| DAY-16/17 | PASS | `page.clock`로 클라이언트 시각만 24시간 진행(서버 재시작·재배포 없음) 후 새로고침 → D-day가 D-12→D-11로 정확히 갱신(빌드/서버 시점에 고정되지 않음 확인) |
| (SSR 확인) | PASS | `curl`로 받은 최초 HTML에 고정된 D-day 값이 없고 빈 상태 문구만 있음(discussion.md 10.3절 서버 렌더 시 `new Date()` 미사용 확인) |

### 23절 — 출처 표시

| ID | 결과 | 확인 내용 |
|---|---|---|
| SRC-01 | PASS | 할 일 상세(AU 비자 신청, sourceUrl 있음)에 출처 링크 표시 |
| SRC-02 | PASS | 가이드 답변(AU "일반 여행자보험으로도 되나요?")에 출처 링크 표시 |
| SRC-03 | PASS | 어려움 답변(AU "법정 최저 조건에 못 미치는 급여")에 출처 링크 표시 |
| SRC-04 | PASS | 나 화면 국가 카드(비자 만료일 줄 아래)에 출처 링크 표시 |
| SRC-05/06/07 | PASS | 홈/할 일/문서 목록 화면에는 출처 링크가 하나도 없음 |
| SRC-10 | PASS | 링크 문구에 도메인 포함("출처 immi.homeaffairs.gov.au" 등) |
| SRC-11 | PASS | `rel="noopener noreferrer"`, `target="_blank"` 확인 |
| SRC-12 | PASS | `aria-label`에 "새 탭에서 열림" 포함 |
| SRC-14/15 | PASS | **JP `jp-move-in`(전입신고) 상세**: 준비물 섹션은 있지만 sourceUrl이 없어 출처 링크 요소 자체가 DOM에 0개(빈 문구·빈 링크 없이 줄 자체가 렌더되지 않음, discussion.md 13.3절 그대로) |

### 12절 — 완료 항목 표시

| ID | 결과 | 확인 내용 |
|---|---|---|
| DONE-01/02/03/05 | PASS | AU 비자 신청을 완료 처리 → 제목 취소선(line-through), 메타 "완료"로 치환, 체크마크 "✓" 표시, 화살표(›) 사라짐 — 모두 한 번에 확인 |

### 13절 — 긴급 alert 색

| ID | 결과 | 확인 내용 |
|---|---|---|
| ALERT-01 | PASS | JP `jp-move-in`(urgent, 미완료) 체크 원 테두리 색이 계산된 `--alert` 토큰 값과 정확히 일치(`rgb(166, 56, 43)` = `#A6382B`) |

### 19절 — 빈 상태

| ID | 결과 | 확인 내용 |
|---|---|---|
| EMPTY-11(문서) | PASS | 문서 목록이 비어 있는 상태(설계상 항상 빈 배열로 시작)에서 "추가된 문서가 없습니다." 빈 상태 문구 표시 |
| EMPTY-15 | PASS | 위 모든 시나리오 실행 동안 브라우저 콘솔 에러 0건 |

---

## 4. 이번에 실행하지 못했거나 해당 없음으로 확인된 항목

- **21절 반응형·PC 화면 전체**: 이 실행 시점에는 사용자 지시로 제외했었다(QAPlan.md 21절 제목에 보류 표시만 남기고 시나리오는 그대로 둠). **2026-08-28 PC 반응형 작업이 재개되면서 보류가 풀렸고, RESP-01~24가 다시 실행 대상이다.** Frontend가 마무리하는 대로 실행 예정(QAPlan.md 24절에도 FONT-14·FONT-15로 3구간 폭에서의 폰트 재확인이 함께 추가됨).
- **19절의 EMPTY-01~10, EMPTY-12, EMPTY-13** (COUNTRIES/TASKS/GUIDE/PAIN이 전부 빈 배열인 상태를 전제로 한 시나리오): Research-team 조사 데이터가 이미 `src/Front/common/data/tasks.ts`에 3개국 전부 채워져 있어(TASKS_BY_COUNTRY·GUIDE_BY_COUNTRY·PAIN_BY_COUNTRY 모두 실데이터 보유), 이 전제 자체를 현재 빌드에서 재현할 수 없다. 데이터가 채워졌다는 것 자체는 결함이 아니라 정상 진행 상황이다. 실제로 여전히 빈 상태인 것은 문서(DOCS, 설계상 항상 빈 배열)뿐이라 그 부분만 EMPTY-11로 확인했다.
- **DAY-11**(체류 허용 기간이 조사되지 않은 국가에서 비자 만료일 줄 자체가 안 보이는 것): 현재 COUNTRIES 3개국 전부 `stayDurationDays`가 채워져 있어 이 조건을 만족하는 국가가 없다. 코드(`MeScreen.tsx`의 `showVisaLine` 로직, `useWabiApp.ts`의 `visaExpiryLabel` 계산)를 읽어 로직상 해당 분기가 올바르게 구현돼 있음은 확인했으나, 실제 데이터로 직접 재현하지는 못했다.

---

## 5. 폰트 상속 회귀 재검증 (FONT-01~10, 2026-08-28)

`app/globals.css`에 `button, input, select, textarea { font-family: inherit; }` 규칙이 추가된 수정본을 대상으로 QAPlan.md 24절을 실행했다. 이 컨테이너에는 한글 시스템 폰트가 없어 육안으로는 두부(tofu)로 보이지만, 판정은 지시받은 대로 `getComputedStyle`로 읽은 `font-family` 문자열을 `body`와 문자 그대로 대조하는 방식으로만 했다.

`body`의 `font-family` 계산값: `"Noto Sans KR", "Noto Sans KR Fallback", system-ui, sans-serif`

| ID | 대상 | 측정값 | `body`와 일치 | 판정 |
|---|---|---|---|---|
| FONT-03 | Segment 탭 버튼(할 일 화면 "현지 정착") | `"Noto Sans KR", "Noto Sans KR Fallback", system-ui, sans-serif` | 일치 | PASS |
| FONT-04 | TabBar 탭 버튼("홈") | 〃 | 일치 | PASS |
| FONT-05 | ListRow 체크 버튼 | 〃 | 일치 | PASS |
| FONT-06 | ListRow 본문 버튼 | 〃 | 일치 | PASS |
| FONT-07 | NextActionCard CTA("지금 하기") | 〃 | 일치 | PASS |
| FONT-08 | BottomSheet 공용 닫기(dim) 버튼 | 〃 | 일치 | PASS |
| FONT-01 | Button 컴포넌트(공용) | 측정 불가 | - | **N/A** — 아래 설명 |
| FONT-02 | Chip(문서 목록 확장자 배지) | `"JetBrains Mono", "JetBrains Mono Fallback", monospace` | **불일치** | 아래 설명(결함 아님) |
| FONT-09 | TextField(할 일 추가 시트 입력란) | `"Noto Sans KR", "Noto Sans KR Fallback", sans-serif` | **불일치** | 아래 설명(경미, 원 결함과 무관) |
| FONT-10 | 총괄 | - | - | 측정 8건 중 6건 일치, 2건 불일치(사유는 아래) |

### FONT-01 — Button 컴포넌트는 현재 화면에 마운트되어 있지 않음

`src` 전체를 `grep`한 결과 `<Button/>`을 import해 실제로 렌더하는 화면이 없다(각 화면이 자체 버튼 마크업을 쓰고, 공용 `Button.tsx`는 아직 어디에도 연결되지 않은 상태). 그래서 실제 DOM 인스턴스가 없어 `getComputedStyle`로 측정할 대상 자체가 없다.

대신 소스를 직접 읽어 확인했다: `Button.tsx`는 순수 `<button type="button">`을 렌더하고, `Button.module.css`에는 `font-family` 선언이 전혀 없다. 즉 이 컴포넌트가 실제로 화면에 쓰이는 순간, 자체 오버라이드가 없으니 이번에 추가된 전역 `button { font-family: inherit }` 규칙을 그대로 받는다 — 그리고 그 전역 규칙 자체는 FONT-03~08에서 이미 실측으로 확인됐다. 따라서 "규칙이 적용될 것"이라는 판단의 근거는 있지만, **이것은 QA가 직접 측정한 결과가 아니라 코드 검토로 대체한 것**이므로 PASS로 기록하지 않고 N/A로 남긴다. Button 컴포넌트가 실제 화면에 연결되는 시점에 재측정이 필요하다(별개로, 디자인 시스템 컴포넌트가 만들어졌는데 아직 어느 화면도 쓰지 않는다는 점은 버그는 아니지만 참고로 남긴다).

### FONT-02 — Chip의 불일치는 결함이 아니라 설계상 의도된 차이

`Chip.module.css`를 확인한 결과 `.chip { font-family: var(--font-mono), monospace; ... }`이 처음부터 명시돼 있다. discussion.md 3.2절이 "숫자·캡션 서체는 JetBrains Mono"라고 정한 대로, 문서 목록의 확장자 배지(`PDF`/`JPG`)는 캡션 성격이라 애초에 body와 다른 서체를 쓰도록 설계된 컴포넌트다.

이번에 보고된 결함은 "폰트를 하나도 선언하지 않은 요소가 상속을 못 받아 브라우저 기본값(Arial 등)으로 떨어지는 것"이었다. Chip은 처음부터 자기 자신의 `font-family`를 명시하고 있어 애초에 **이 결함**(상속 누락)의 영향을 받는 대상은 아니었다 — 이 부분 판단은 여전히 맞다.

> **정정(추가 보고 반영)**: 다만 그 뒤 "Chip이 국가 선택처럼 한글 라벨도 담는 컴포넌트"라는 점이 확인되면서, `var(--font-mono)`를 계속 쓰는 것 자체가 **별개의 실제 결함**(한글 글리프를 담지 못해 라벨이 깨짐)이라는 것이 드러났다. 위 문단에서 "Chip은 PASS"라고 정리한 것은 상속 누락이라는 좁은 기준으로는 맞지만, Chip의 폰트 선택 자체가 문제없다는 뜻으로 읽히면 잘못이다. Frontend에 본문 서체(discussion.md 3.2절 `label` 규격: 13px, 미선택 500 / 선택 700)로 맞추도록 지시했고, QAPlan.md 24절에 FONT-11(콘텐츠 성격과 서체 일치 전수 확인) · FONT-12(Chip 크기·굵기)를 추가해 뒀다. 수정본이 도착하면 재실행해 이 절에 결과를 추가한다.

### FONT-09 — TextField의 불일치, 이후 해결됨

`TextField.module.css`에도 `.field { font-family: var(--font-body), sans-serif; }`가 처음부터 명시돼 있어, 역시 이번 전역 `inherit` 규칙과 무관하게 자기 자신의 선언을 쓴다(우선순위상 클래스 선택자가 전역 element 선택자보다 앞선다). 문제는 이 자체 선언이 body의 스택과 완전히 같지 않다는 것이다.

- body: `"Noto Sans KR", "Noto Sans KR Fallback", system-ui, sans-serif`
- TextField: `"Noto Sans KR", "Noto Sans KR Fallback", sans-serif` — 중간의 `system-ui` 폴백 단계가 빠져 있다.

1순위 폰트(`Noto Sans KR`)는 동일해서 평상시 렌더링에는 차이가 없고, `Noto Sans KR` 로딩이 실패하는 드문 경우에만 body는 `system-ui`를 한 단계 더 거치고 TextField는 곧장 브라우저 sans-serif 기본값으로 넘어가는 차이가 생긴다는 것이 최초 실행(2026-08-28) 시점의 판단이었다.

> **해결(2026-08-28 재검증)**: PM이 직접 실측해 같은 차이를 확인했고, 원인이 P-07(전역 `inherit` 규칙 도입) 이후로는 불필요해진 `TextField.module.css`의 자체 `font-family` 선언이라는 것을 특정해 Frontend에 제거를 지시했다. 수정본을 헤드리스 브라우저로 재검증한 결과 `TextField.module.css`에서 `font-family` 선언이 완전히 제거됐고, 모바일(390px)·태블릿(800px)·데스크톱(1280px) 세 구간 모두에서 `getComputedStyle` 값이 `body`와 문자 그대로 일치했다(`"Noto Sans KR", "Noto Sans KR Fallback", system-ui, sans-serif`). **FONT-09 해결 확인.**

### 결론

보고된 결함(“button/input이 body의 font-family를 상속하지 못해 브라우저 기본 폰트로 렌더됨”)은 **해결 확인**. 실제로 전역 `inherit` 규칙에 의존하는 모든 순수 버튼류(Segment/TabBar/ListRow/NextActionCard/BottomSheet)에서 body와 완전히 동일한 계산값이 나왔다. 재검증 과정에서 원래 결함과 무관한 두 가지를 추가로 확인했다 — Chip은 결함이 아니라 설계 의도, TextField는 원 결함과 무관한 경미한 스타일 불일치(선택 사항으로 정리 권장). Button 컴포넌트는 아직 화면에 쓰이지 않아 직접 측정하지 못했다.

---

## 6. 반응형 · PC 화면 검증 (RESP-01~24, 2026-08-28)

PC 반응형 작업이 완료됐다는 보고와 함께 경계값 실측치(639px→480, 640px→520, 1024px→240+브랜드 노출, 바텀시트 1023px 이하/1024px 이상 형태, 할 일 상세 1024px 이상에서 x=240·폭 784)를 전달받았다. **이 수치를 그대로 신뢰하지 않고 헤드리스 브라우저로 모두 독립적으로 재측정**했다. 결과: **보고된 수치 전부 정확했고, RESP-01~24 24개 시나리오 전체 통과, 새로 발견된 결함 없음.**

### 6.1 구간 전환 · 내비게이션 (RESP-01~10)

| ID | 결과 | 확인 내용 |
|---|---|---|
| RESP-01 | PASS | `< 640px`(639px): shell 폭 480px, nav가 shell 하단에 폭 480px로 부착, 사이드바 브랜드 숨김 |
| RESP-02 | PASS | `640~1023px`(640px, 1023px 양끝 모두): shell 폭 520px로 확대, 하단 탭바 유지 |
| RESP-03 | PASS | `>= 1024px`: 사이드바 폭 240px, 좌측 상단(x=0, y=0) 고정 |
| RESP-04 | PASS | 639→640px, 1023→1024px 경계에서 정확히 전환(480→520, 520→사이드바) |
| RESP-05 | PASS | 1024px에서 사이드바 상단에 브랜드(W 로고 + "Wabi") 노출 |
| RESP-06 | PASS | 639px·1023px·1024px 세 구간 모두 `<nav>` 요소 정확히 1개 |
| RESP-07 | PASS | 900px→1100px 리사이즈 시 nav DOM 노드가 재마운트되지 않고 유지(커스텀 데이터 속성으로 동일 노드 여부 확인) |
| RESP-08 | PASS | 1024px: 탭 버튼들이 같은 x좌표(세로 배치), 순서대로 아래로 쌓임 |
| RESP-09 | PASS | 639px·800px(태블릿 대표값) 모두 탭 버튼이 같은 y좌표(가로 배치), nav 하단 부착 |
| RESP-10 | PASS | 모바일 폭에서 '할 일' 탭 선택 후 데스크톱 폭으로 리사이즈해도 선택 상태 유지 |

### 6.2 바텀시트 → 데스크톱 중앙 모달 (RESP-11~16)

| ID | 결과 | 확인 내용 |
|---|---|---|
| RESP-11 | PASS | 1280px: 시트가 뷰포트 상/하단에 붙지 않고 중앙에 위치(y=249, y+h=652, vh=900) |
| RESP-12 | PASS | 1280px: 모달 폭 480px(최대폭 이하) |
| RESP-13 | PASS | 1280px: `border-radius` 네 모서리 모두 26px |
| RESP-14 | PASS | 1280px: 등장 애니메이션이 `wabiModalIn`(모바일의 `wabiSheetUp`과 다름) |
| RESP-15 | PASS | 1280px: 상단 핸들 숨김 |
| RESP-16 | PASS | 900px(태블릿): 시트 하단이 뷰포트 하단에 부착, `border-radius` 위쪽만 26px, 핸들 보임, 애니메이션 `wabiSheetUp` |

### 6.3 할 일 상세 — 사이드바 오프셋 (RESP-17~19)

| ID | 결과 | 확인 내용 |
|---|---|---|
| RESP-17 | PASS | 1024·1100·1280·1440px **네 개 데스크톱 폭에서 각각** 상세 오버레이 시작 x좌표가 정확히 240px(사이드바 폭)이고, 사이드바는 계속 보이며, 본문 콘텐츠 실제 폭은 항상 `min(뷰포트-240, 720)`px로 계산된 값과 일치 |
| RESP-18 | PASS | 상세가 열린 채로 사이드바의 다른 탭을 클릭하면 상세가 닫히고 정상적으로 화면 전환(4개 폭 모두 확인) |
| RESP-19 | PASS | `< 1024px`(900px): 상세가 x=0, 뷰포트 전체 폭을 덮는 전체 화면 형태 유지 |

**보고받은 "폭 784"에 대한 확인**: 소스(`TaskDetailScreen.module.css`)를 보면 데스크톱에서 오버레이는 `left: 240px`만 지정돼 있고 폭 자체를 고정하지 않는다. 오버레이의 실제 폭은 `뷰포트 폭 - 240px`로 뷰포트마다 달라진다(1024px에서는 784px이 맞지만, 1100px에서는 860px, 1280px에서는 1040px, 1440px에서는 1200px로 나온다 — 실측으로 확인). 다만 이용자 눈에 보이는 **본문 콘텐츠 자체의 폭은 `.inner`에 `max-width: 720px`로 고정**돼 있어 어떤 데스크톱 폭에서도 720px로 일정하다(네 폭 모두 실측 720px). 즉 "784"는 결함이 아니라 1024px이라는 특정 뷰포트 하나에서만 성립하는 오버레이 바깥 컨테이너 값이고, 실제로 고정되어야 하는 값(discussion.md 11.1절이 말하는 "본문과 같은 폭")은 720px이 맞다. 보고 자체가 틀린 것은 아니지만, 그 수치를 "고정값"으로 오해하지 않도록 QAPlan.md RESP-17 항목에 이 구분을 남겨 둔다.

### 6.4 회귀 확인 — 정보 예산 · 색상 토큰 · 규격 (RESP-20~24)

| ID | 결과 | 확인 내용 |
|---|---|---|
| RESP-20 | PASS | 1280px에서 홈 화면 최상위 블록 구성(D-day/진행률/NEXT카드/이번 주 할 일/어려움 블록) 그대로, 새 블록 없음 |
| RESP-21 | PASS | 사이드바 배경(`rgb(255,255,255)` = `--surface`), 브랜드 로고 배경(`rgb(18,19,18)` = `--ink`) 모두 discussion.md 3.1절의 기존 10개 토큰 값과 정확히 일치. 새로 정의된 색상 없음 |
| RESP-22 | PASS | 1280px에서 가이드 버튼 48×48px, 홈 탭 239×48px — 최소 48×48px 유지 |
| RESP-23 | PASS | 1280px 리스트 행 높이 65px(64px 이상) |
| RESP-24 | PASS | 1280px에서도 상태(y=80) < NEXT카드(y=200) < 목록(y=421) 순서로 시선 순서 유지 |

**21절 결론: RESP-01~24 전체 통과, 결함 없음.**

## 7. 폰트 3구간 재확인 및 Chip·SourceLink 수정 검증 (FONT-11~15, 2026-08-28)

Chip 한글 깨짐(FONT-11·12)과 SourceLink 서체 분리(FONT-13) 수정, 그리고 PC 반응형 작업으로 폰트 수정이 되돌아가지 않았는지(FONT-14·15)를 모바일(390px)·태블릿(800px)·데스크톱(1280px) 세 구간 모두에서 재실행했다.

| ID | 390px | 800px | 1280px | 비고 |
|---|---|---|---|---|
| FONT-01~08, 10 (기존 상속 수정) | PASS | PASS | PASS | 세 구간 모두 유지, PC 작업으로 되돌아가지 않음 |
| FONT-02 (Chip font-family) | PASS | PASS | PASS | `Chip.module.css`에서 `font-family: var(--font-mono)` 제거 확인 — 실제 문서 확장자 배지에서 `body`와 동일한 값 측정 |
| FONT-11 (mono 허용 범위) | PASS | PASS | PASS | mono는 `NextActionCard`의 "NEXT" 캡션 한 곳에서만 나오고, 그 외 전부 `body`와 동일 |
| FONT-12-미선택 | PASS | PASS | PASS | Chip 미선택(실제 렌더 인스턴스) `13px`/`500` 실측 확인 |
| FONT-12-선택 | N/A | N/A | N/A | Chip의 선택(button) 변형은 이번에도 화면 어디에도 실제로 렌더되지 않아 측정 불가. `Chip.module.css` 코드 검토로 대체: `.chip{font-size:13px}`(공통), `.selected{font-weight:700}` 선언 확인(FONT-01과 같은 성격의 제약) |
| FONT-13-라벨 | PASS | PASS | PASS | `SourceLink`의 "출처" 라벨이 `body`와 동일한 서체로 분리됨 |
| FONT-13-도메인 | PASS | PASS | PASS | 같은 링크의 도메인 부분만 별도 `<span>`으로 분리돼 `var(--font-mono)` 적용 확인 |
| FONT-15 (데스크톱 사이드바 nav 버튼) | - | - | PASS | 1280px 사이드바 탭 버튼이 390px 결과와 동일하게 `body`와 일치(FONT-04와 동일 요소, 폭만 다름) |
| FONT-09 (TextField) | FAIL(당시) | FAIL(당시) | FAIL(당시) | 5절에서 이미 보고한 경미한 기존 불일치(`system-ui` 폴백 누락)가 이 시점까지는 세 구간 모두에서 동일하게 재현됨(PC 작업이 새로 만든 것이 아니라 기존 이슈가 남아있던 것). **이후 별도 수정·재검증으로 해결됨 — 아래 9절 참고.** |

**결론**: Chip 한글 깨짐, SourceLink 서체 분리, mono 허용 범위 축소 — **모두 세 구간에서 정확히 적용됨을 확인**. PC 반응형 작업이 기존 폰트 수정을 되돌리지도 않았다. 이 시점에 유일하게 통과하지 못했던 FONT-09(TextField)는 5절에서 이미 보고한 기존 항목의 재확인이었고(이번 작업들과는 무관, 신규 결함 아님), **이후 9절에서 해결이 확인됐다.**

---

## 8. TextField 원인 특정 및 최종 해결 확인 (FONT-09, 2026-08-28)

PM이 직접 실측해 FONT-09(body와 TextField의 `system-ui` 폴백 차이)를 재확인하고, 원인을 `TextField.module.css`의 자체 `font-family` 선언으로 특정했다 — P-07(전역 `button/input/select/textarea { font-family: inherit }` 도입) 이후로는 이 자체 선언이 불필요해졌는데 남아 있었던 것이다. Frontend에 선언 제거를 지시했다.

**QA 재검증**: 수정본에서 `TextField.module.css`에 `font-family` 선언이 완전히 제거된 것을 소스로 확인한 뒤, 헤드리스 브라우저로 모바일(390px)·태블릿(800px)·데스크톱(1280px) 세 구간 모두에서 `getComputedStyle`로 재측정했다.

| 구간 | TextField `font-family` | `body`와 일치 |
|---|---|---|
| 390px | `"Noto Sans KR", "Noto Sans KR Fallback", system-ui, sans-serif` | 일치 |
| 800px | 〃 | 일치 |
| 1280px | 〃 | 일치 |

**FONT-09 해결 확인.** 이 시점에는 FONT-01·FONT-12-선택 두 건만 화면에 실제 렌더 인스턴스가 없어 코드 검토로 대체된 상태였다 — **이후 9절에서 디자인 시스템 미리보기 카드로 실측 재확인해 이 제약도 해소됐다.**

---

## 9. Button · Chip-선택 커버리지 공백 해소 — 디자인 시스템 미리보기 카드 실측 (2026-08-28)

5절·7절에서 FONT-01(`Button`)과 FONT-12-선택(`Chip`의 selected 변형)은 앱 화면 어디에도 실제 렌더 인스턴스가 없어 소스 코드 검토로만 판단했다고 기록했다. PM으로부터 디자인 시스템 동기화로 생성된 미리보기 카드(`ds-bundle/components/general/{Button,Chip}/{Button,Chip}.html`)에는 두 컴포넌트의 모든 variant가 실제로 렌더된다는 정보를 받았다. **PM의 실측 결과를 그대로 옮기지 않고 QA가 직접 재확인했다.**

- 두 HTML은 `file://` 프로토콜로 여는 정적 페이지라 개발 서버가 필요 없다. 헤드리스 Chromium으로 직접 열어 확인했다.
- 페이지 내부를 먼저 읽어보니 `window.Wabi`에 연결된 실제 빌드 산출물(`_ds_bundle.js`)을 React로 마운트하는 구조였고, `Chip.html`은 `Selectable` story에서 `<Chip label="호주" selected={true} .../>`를 실제로 렌더하고 있어 selected 변형도 실측 가능함을 확인했다.
- 다만 이 정적 번들은 앱과 별도의 CSS 진입점(`ds-bundle/_ds_bundle.css`)을 쓰고, `--font-body: "Noto Sans KR"`로 앱의 next/font 합성 폴백 이름(`"Noto Sans KR Fallback"`)이 빠져 있다는 차이를 먼저 확인했다. 그래서 판정 기준은 앱의 `body` 문자열이 아니라 **이 카드 자체의 `body` 계산값**과 대조하는 것으로 조정했다(자기 참조 비교 — 대상이 이 페이지의 `body`가 상속하는 값과 같은지).
- **원인(PM 확인, `.design-sync/NOTES.md` "앱과 번들의 의도된 차이: 폰트 대체 스택" 절에 기록됨)**: `"Noto Sans KR Fallback"`은 `next/font/google`이 자동 생성하는 지표 보정용 폴백으로, `url()` 없이 `local()`과 `size-adjust`로만 정의돼 실제 글리프 파일이 아니다. 그래서 디자인 시스템 변환기의 폰트 복사 대상에서 빠졌다(번들 `fonts.css`에 이 페이스가 0건). 이름만 스택에 남기면 존재하지 않는 패밀리라 그냥 지나가므로, 억지로 맞추지 않고 **의도된 차이**로 남기기로 했다 — 번들은 폰트 파일을 로컬로 함께 실어 로드가 즉시 끝나 이 폴백의 효용이 사실상 없기 때문이다. 이 QA 문서와 `.design-sync/NOTES.md`가 같은 결론(카드 측정은 앱 `body`가 아니라 카드 `body` 기준)을 기록해 뒀으니, 다음에 이 카드로 폰트를 재측정할 때는 두 문서 중 하나만 봐도 이 한 단계 차이를 결함으로 오인하지 않을 수 있다.

| ID | 결과 | 확인 내용 |
|---|---|---|
| FONT-01(Button) — Primary | PASS | "지금 하기" 버튼(기본), `font-family`가 카드 `body`와 일치 |
| FONT-01(Button) — Secondary | PASS | "나중에 하기" 버튼(`variant="secondary"`), 일치 |
| FONT-01(Button) — Disabled | PASS | "완료됨" 버튼(`disabled`), 일치 |
| FONT-01(Button) — ActionPair | PASS | Primary+Secondary 조합 story, 일치(추가 확인) |
| FONT-12-선택(Chip) | PASS | `Selectable` story의 "호주" 칩(`selected=true`) — `font-family` 카드 `body`와 일치, `font-size` `13px`, `font-weight` `700` 실측 확인 |
| FONT-12-미선택(Chip) | PASS | 같은 story의 "캐나다" 칩(미선택) — `font-family` 일치, `13px`/`500` 실측 재확인(7절 결과와 동일, 교차 검증) |

**결론**: PM이 짚어준 미리보기 카드로 두 건 모두 실측 확인했다. **FONT-01, FONT-12-선택 모두 "코드 검토로 대체"가 아니라 "실제 렌더 인스턴스 측정으로 통과 확인"으로 정정한다.** 이로써 QAPlan.md 24절(FONT-01~15) 전 항목이 예외 없이 실측 기준으로 결함 없이 통과했다.

---

## 11. 파일 저장 기능 — 취소 전 부분 실행 결과, 그리고 취소 (2026-08-28)

QAPlan.md 25절(파일 저장 — IndexedDB, 암호화, 파일별 키, 60일 보관, 매직 넘버 검사)을 우선순위대로 실행하던 도중, **파일 저장 기능 자체가 폐기되고 문서 탭이 메모 탭으로 대체된다는 방향 전환**이 있었다(discussion.md 16절 전면 재작성, 16.1절 "폐기 이유" — 암호화·키 파쇄·보관 기간·매직 넘버 검사가 이 앱 크기에 비해 딸려 오는 것이 너무 많았고, 대안인 File System Access API는 Safari·Firefox 미지원이라 채택 불가).

방향 전환 시점까지 실제로 실행해 확인한 것은 다음과 같다(전부 통과, 결함 없음).

| ID | 결과 | 확인 내용 |
|---|---|---|
| KEY-01 | PASS | 파일 2개 추가 → `keys` 스토어에 레코드 정확히 2개, 각각 `docs`의 파일 `id`와 1:1 대응 |
| KEY-02 | PASS | **교차 복호화로 서로 다른 키임을 증명**: 파일 A의 IV·암호문을 파일 B의 `CryptoKey`로 복호화 시도 → `OperationError`로 실패(두 키가 실제로 다름을 간접 확인) |
| KEY-03 | PASS | 파일 A를 삭제하면 `docs`·`keys` 양쪽에서 A의 레코드만 사라지고 B는 그대로 남음 |
| KEY-04 | PASS(관측 + 소스 근거) | KEY-01~03 전 과정에서 `docs`·`keys` 카운트가 항상 함께 움직여 불일치 상태가 관측된 적이 없음. `docFiles.ts`의 `deleteRecordAndKey`/`putDocFile`이 `db.transaction([DOCS_STORE, KEYS_STORE], "readwrite")` 하나로 두 스토어를 묶어 커밋하는 것도 소스로 확인 |

KEY-05(60일 스윕에서도 파일+키 함께 삭제)를 실행하던 중 방향 전환 지시를 받아 그 이후(KEY-05, MAGIC-01~03, CRYPTO 계열, PURGE 계열, DOCFILE 계열, COPY-DOC 계열)는 **실행하지 않고 중단**했다.

**남겨두는 이유**: 위 네 건이 통과했다는 사실 자체는 "암호화·파일별 키 설계가 실제로 잘 구현돼 있었다"는 근거이며, 나중에 파일 저장 기능이 다시 논의될 때(예: 이번에 폐기된 File System Access API 대신 다른 방식으로) 이 구현이 어느 지점까지 검증됐었는지 참고할 수 있다. QAPlan.md 25절도 삭제하지 않고 취소 표시만 남겨 같은 이유를 설명해 두었다.

메모 기능(26절)으로 넘어간다.

---

## 13. 메모 기능 실행 결과 (MEMO-01~17 · COPY-MEMO-01~06, 2026-08-28)

QAPlan.md 26절을 실행했다. **29개 시나리오 전부 통과, 결함 없음.**

### 13.1 추가·편집·삭제·지속성·표시

| ID | 결과 | 확인 내용 |
|---|---|---|
| MEMO-16 | PASS | 메모 없는 상태에서 빈 상태 문구 `아직 적어 둔 메모가 없습니다.` 정확히 일치 |
| MEMO-17 | PASS | 추가 시트·편집 시트 **둘 다**에서 `계좌번호나 여권번호처럼 민감한 정보는 적지 않기를 권합니다.` 안내 확인 |
| MEMO-15 | PASS | 본문이 비어 있을 때 "저장하기" 버튼이 `disabled` |
| MEMO-01 | PASS | 여러 줄(3줄) 메모 추가 → `localStorage`에 본문 그대로(줄바꿈 포함) 저장 확인 |
| MEMO-10 | PASS | 목록에는 첫 줄(`첫 번째 메모`)만 표시, 나머지 줄 노출 안 됨 |
| MEMO-13 | PASS | 목록 행 높이 65px(≥64px) |
| MEMO-12 | PASS | 메타 `수정 8월 28일` 형식 정확히 일치 |
| MEMO-11 | PASS | 편집 시트를 다시 열면 `TextArea` 값이 원본과 완전히 동일(줄바꿈 보존, `\n` 안 깨짐) |
| MEMO-14 | PASS | 편집 중 내용을 바꾼 뒤 "취소" → `localStorage`의 원본이 그대로 유지됨(저장 안 됨) |
| MEMO-02 | PASS | 편집 후 저장 → 본문과 `updatedAt`(ISO 타임스탬프) 둘 다 갱신 확인 |
| MEMO-07 | PASS | 새로고침 후에도 메모가 목록에 그대로 유지 |
| MEMO-05 | PASS | 삭제 확인 다이얼로그에서 취소(dismiss) → 개수 유지 |
| MEMO-03 | PASS | 삭제 확인(accept) → 개수 1 감소, `localStorage`에서도 제거 확인 |
| MEMO-04 | PASS | 삭제 확인 다이얼로그 메시지 `메모를 삭제할까요?` 존재 확인 |

### 13.2 정렬 — `updatedAt`이 날짜가 아니라 전체 ISO 타임스탬프라는 점을 직접 확인

PM이 특히 짚은 항목이라 화면 표시(날짜만 보임)에 의존하지 않고 **`localStorage` 원시 값과 목록 순서를 매번 직접 대조**하는 방식으로 검증했다.

- 실제 저장값 확인: `updatedAt`이 `"2026-08-28T05:15:06.668Z"` 같은 전체 ISO 타임스탬프였다(소스 검토로도 `new Date().toISOString()` 확인, `wabiLogic`이 아니라 `saveNote()`가 클릭 시점에 직접 호출).
- MEMO-08(3개 추가 직후 정렬), MEMO-09(가장 오래된 메모를 다시 수정했을 때 맨 위로 이동), MEMO-08-09-scramble(세 메모를 뒤섞어 편집한 뒤 정렬) **세 라운드 모두** — 매번 `localStorage`를 읽어 `updatedAt` 내림차순으로 직접 정렬한 값과 화면 목록의 순서를 문자열째 비교했고, **세 라운드 전부 정확히 일치**했다.
- 예시(스크램블 라운드 원시 타임스탬프, 전부 같은 날 다른 초·밀리초): `["2026-08-28T05:15:09.532Z", "2026-08-28T05:15:09.293Z", "2026-08-28T05:15:09.770Z"]` — 화면 표시로는 전부 "8월 28일"이라 구분이 안 되지만, 실제 정렬은 이 밀리초 단위 값 기준으로 정확했다.

**결론: 같은 날 여러 메모를 순서를 바꿔 가며 수정해도 "최근 수정 순" 정렬이 정확하다. 결함 없음.**

### 13.3 카피 회귀 — 파일 저장 시절 문구 전수 검색

메모 탭·홈·할 일·나 4개 탭과 가이드 시트·할 일 추가 시트·메모 추가 시트를 모두 열어 `document.body.innerText`를 검색했다.

| ID | 결과 | 확인 내용 |
|---|---|---|
| COPY-MEMO-01 | PASS | 메모 화면 안내 `기억해 둘 것을 적어 두세요. 이 기기에만 저장됩니다.` 정확히 일치 |
| COPY-MEMO-02 | PASS | "기기에만 저장" 문구는 메모 관련 화면(메모 탭, 메모 추가 시트)에만 등장. 다른 화면에는 없음 |
| COPY-MEMO-03 | PASS(3건) | "60일", "자동으로 삭제", "만료일 알림" — 앱 전체 어디에도 없음 |
| COPY-MEMO-04 | PASS(4건) | "암호화", "복호화", "매직 넘버", "위장" — 앱 전체 어디에도 없음 |
| COPY-MEMO-05 | PASS | 탭 순서 `["홈","할 일","메모","나"]` — 라벨만 "메모"로 바뀌고 위치·4탭 구성 그대로 |
| COPY-MEMO-06 | PASS(소스 검토) | discussion.md 16.5절이 지목한 `docFiles.ts`, `common/docs/`, `AddFileSheet.*`, `DocPreviewSheet.*`, `DocItem` 타입, `wabiLogic.ts`의 `daysUntilPurge`(와 그 테스트) 전부 저장소에서 실제로 삭제됨을 `find`/`grep`으로 확인 |

콘솔 에러 0건.

---

## 14. `SourceLink` 스킴 검사 실행 결과 (SRC-19~22, 2026-08-28)

| ID | 결과 | 확인 내용 |
|---|---|---|
| SRC-20 | PASS | `https://` URL은 정상 렌더 |
| SRC-22 | PASS | `tasks.ts`의 `sourceUrl` 30개(19개로 파악했던 이전 집계보다 늘어남 — 실제로 셈해 보니 30개) 전수 확인, 전부 `https://`로 시작 |
| SRC-19 | **PASS(실제 앱 재확인 후)** | 아래 설명 참고 — 처음 측정값은 결함처럼 보였으나 원인은 오래된 테스트 도구였다 |
| SRC-21 | PASS(분석 근거) | 아래 설명 참고 |

### SRC-19 — 첫 측정 실패, 원인 규명, 실제 앱 재확인

`ds-bundle`의 `SourceLink.html` 미리보기 카드(이전 라운드에서 Button·Chip을 검증했던 것과 같은 방식)로 `window.Wabi.SourceLink`에 직접 `url="http://..."`을 넘겨 렌더링해 봤더니 **정상적으로 링크가 렌더됐다** — 처음엔 스킴 검사가 빠진 결함처럼 보였다.

원인을 규명하기 위해 `ds-bundle/components/general/SourceLink/SourceLink.jsx`를 열어 보니 `window.Wabi.SourceLink`를 재노출(re-export)할 뿐이고, 실제 구현은 빌드 시점에 스냅샷된 `_ds_bundle.js` 안에 있었다. 즉 **이 번들이 스킴 검사가 추가되기 전 버전으로 굳어 있어서 생긴 결과**였다(`.design-sync/NOTES.md`가 이미 경고해 둔 "Re-sync 위험" — PC 반응형 때 컴포넌트 CSS가 바뀌면 미리보기가 낡을 수 있다고 적어 둔 것과 같은 종류의 드리프트가 로직에서도 일어난 것).

번들을 신뢰하지 않고 **실제 앱을 직접 재확인**했다. `au-visa` 할 일의 `sourceUrl` 한 곳만 `https://`→`http://`로 잠깐 바꿔(한 군데만 고유하게 특정되는 문맥으로 편집) 실제 개발 서버에서 그 항목의 상세를 열어 봤더니 **출처 링크가 전혀 렌더되지 않았다**(`SourceLink`가 있어야 할 자리에 링크 요소 0개). 확인 직후 원래 값으로 즉시 되돌렸고 `git diff`로 그 파일에 다른 변경이 남지 않았음을 확인했다. **실제 앱은 정상 동작한다.**

### SRC-21 — 대소문자·변형 스킴

WHATWG URL 파서(Node로 직접 검증, Chromium과 동일 표준을 따르므로 브라우저 결과와 다르지 않음)에서:

- `"HTTPS://example.com"` → `protocol` = `"https:"`(정규화됨) — **정당한 https URL이므로 렌더되는 것이 맞다.** 이걸 "막혀야 한다"고 기대했던 최초 시나리오 설명이 부정확했다.
- `"https:/example.com"`(슬래시 하나) → 같은 이유로 `"https:"`로 파싱되어 정상 렌더가 맞다.
- `"HTTP://example.com"`(대문자 http) → `protocol` = `"http:"` — SRC-19에서 실제 앱으로 이미 확인한 것과 같은 검사(`protocol !== "https:"`)에 걸려 차단된다. 스킴 정규화 자체가 플랫폼 표준 동작이라 별도 앱 코드가 대소문자를 잘못 다룰 여지가 없다.

**정정**: QAPlan.md SRC-21의 "대문자 HTTPS·슬래시 하나 URL이 막혀야 한다"는 기대는 틀렸다. 다음 갱신 때 QAPlan.md에도 이 정정을 반영해 둔다(대문자 HTTPS/슬래시 하나는 정상 렌더가 정답이고, 대문자 HTTP만 차단이 정답).

### 참고 — 발견된 도구 이슈(앱 결함 아님)

`ds-bundle`이 `SourceLink`의 스킴 검사 이전 버전으로 낡아 있다. 이번 SRC-19 확인처럼 번들을 신뢰하지 않고 실제 앱으로 교차 확인하는 습관 덕에 오탐을 걸러냈지만, **다음 디자인 동기화 때 `build-styles.mjs`류 재생성 스크립트를 한 번 돌려 번들을 최신화**해 두는 것을 권장한다(9절에서 Button/Chip을 검증할 때는 마침 최신 상태였어서 문제가 없었다).

---

## 15. FONT-16 `TextArea` 실행 결과 (2026-08-28)

| ID | 결과 | 확인 내용 |
|---|---|---|
| FONT-16 | PASS(390/800/1280px 세 구간 모두) | 메모 추가 시트의 `TextArea`(`textarea` 요소) `font-family`가 세 구간 모두에서 `body`와 완전히 일치 |

---

## 16. Frontend 보고 사항 독립 재검증 (typecheck · build · TZ 3종, 2026-08-28)

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | PASS(에러 0건) |
| `npm run build` | PASS(정적 페이지 생성 완료, 에러 없음) |
| `npm run test:local-date`를 `TZ=Asia/Seoul`·`TZ=UTC`·`TZ=America/Toronto`로 각각 재실행 | 세 번 모두 `PASS: 세 시간대 모두에서 localDate 함수 결과가 일치합니다.` |

Frontend가 보고한 세 가지 모두 그대로 재현됐다.

---

## 18. 반응형 — 태블릿 · PC 실행 결과 (TPC-01~29, 2026-08-28)

QAPlan.md 29절을 실행했다. **캔버스(06절) 기준으로 결함 없이 일치함을 확인했다.** PM의 실측을 그대로 옮기지 않고 전부 독립적으로 재측정했고, 실행 과정에서 QAPlan.md 시나리오 자체의 오류 2건을 발견해 그 자리에서 정정했다.

### 18.1 브레이크포인트·세부 규격

| ID | 결과 | 확인 내용 |
|---|---|---|
| TPC-01~04 | PASS | 743px(모바일, nav 폭 480) → 744px(태블릿, nav 폭 88) → 1179px(태블릿 유지) → 1180px(데스크톱, nav 폭 236) 경계 정확히 전환 |
| TPC-05 | PASS | 태블릿 아이콘 레일 폭 88px |
| TPC-09 | PASS | 태블릿 본문 폭 620px |
| TPC-12 | PASS | 데스크톱 사이드바 폭 236px |
| TPC-21 | PASS | 홈·메모 우측 패널 폭 각각 336px |

### 18.2 **없어야 할 우측 패널 — 4화면 전수 확인**

| ID | 결과 | 확인 내용 |
|---|---|---|
| TPC-25-panel-home | PASS | 데스크톱 홈에 `<aside>` 패널 1개 존재(내 메모) |
| TPC-25-panel-notes | PASS | 데스크톱 메모에 `<aside>` 패널 1개 존재(WRITING) |
| TPC-25-panel-tasks | PASS | 데스크톱 할 일에 `<aside>` 패널 **0개** — PM이 보고했던 "홈의 메모 패널 잔존" 결함은 **실제로 존재하지 않음**을 확인(아래 18.5절 참고) |
| TPC-25-panel-me | PASS | 데스크톱 나에 `<aside>` 패널 **0개** |
| TPC-26-bodywidth-tasks/me | PASS | 패널이 없는 두 화면은 본문이 620px 중앙 정렬(사이드바+1열) |

### 18.3 타이포 확장 — 실행 중 QAPlan 시나리오 오류 발견 및 정정

| ID | 결과 | 확인 내용 |
|---|---|---|
| TPC-28-dday(모바일/태블릿/데스크톱) | PASS | D-day `60px → 72px → 88px` 3단계 전부 실측 확인(회귀 없음, 원래 QAPlan에 이미 정확히 적혀 있었음) |
| TPC-28-title(모바일/데스크톱) | PASS | 모바일 24px, 데스크톱 30px |
| TPC-28-title(태블릿) | **최초 측정 FAIL → QAPlan 기대값 오류로 판명, 정정** | 태블릿(900px)에서 실측 30px이 나왔는데, QAPlan.md에는 "제목은 데스크톱에서만 24→30"이라고 적혀 있어 처음엔 결함처럼 보였다. `Docs/Design/WabiDesignSystem.dc.html` 06절의 `Tablet · 834 × 1000 · 할 일` 목업을 직접 스크린샷 떠서 육안으로 확인한 결과, **캔버스 자체가 태블릿에서 이미 커진 제목을 보여주고 있었다** — 즉 실제 구현이 맞고 QAPlan.md가 틀렸던 것이다. QAPlan.md TPC-28을 "제목은 태블릿(744px)에서 이미 30px로 커지고 데스크톱까지 유지"로 정정했다. |
| TPC-28-body(3구간) | PASS | 본문 관련 텍스트(예: 메모 안내 문구)는 구간과 무관하게 화면별 고정 크기 그대로, D-day·제목처럼 확대되지 않음 |

### 18.4 본문 620px 상한 — 실행 중 두 번째 QAPlan 오류 발견 및 정정

| ID | 결과 | 확인 내용 |
|---|---|---|
| TPC-26-bodywidth-home/notes | **최초 측정 FAIL → 측정 대상 오류로 판명, 정정** | 데스크톱 홈·메모의 `.main`(우측 패널과 나란한 flex 컨테이너) 폭을 쟀더니 708px가 나와 처음엔 620 상한을 넘긴 결함처럼 보였다. 실제로는 `.main`이 `flex:1`(사이드바·우측 패널을 뺀 나머지 공간을 그대로 채움) + `padding: 46px 44px`인 것이 설계대로였고, 그 안의 **실제 콘텐츠**(`NextActionCard`, 할 일 목록 등)를 다시 재니 정확히 `708 − 44 − 44 = 620px`였다. 캔버스 `Desktop · 1280 × 800 · 홈` 목업을 스크린샷으로 떠서 실제 렌더와 나란히 놓고 봐도 카드·목록 폭이 시각적으로 동일했다. **QAPlan.md TPC-26에 "패널이 있는 화면은 `.main`이 아니라 콘텐츠 요소 자체를 재야 한다"는 주의사항을 정정해 추가했다.** |

### 18.5 캔버스 목업과 실제 렌더 육안 대조 (VISUAL, 요청받은 항목)

`file://`로 `Docs/Design/WabiDesignSystem.dc.html`을 열어 06절의 목업 3개(`Desktop·홈`, `Desktop·메모`, `Desktop·나`)와 1개(`Tablet·할 일`)를 각각 스크린샷으로 뜨고, 실제 앱을 같은 뷰포트(1280×800 또는 834×1000)로 띄워 나란히 놓고 확인했다.

| 대조 쌍 | 결과 |
|---|---|
| Desktop·홈 | **레이아웃 일치** — 사이드바→D-day/진행률→NEXT카드→이번 주 할 일 순서, 우측 "내 메모" 패널(메모 목록+하단 어려움 카드) 배치 전부 캔버스와 동일. 카드·목록 폭도 육안상 동일(18.4절에서 수치로도 재확인). |
| Desktop·메모 | **레이아웃 일치** — 목록 + 우측 WRITING 패널(제목 입력/내용 입력/안내문구/저장·삭제 버튼) 배치가 캔버스와 동일. |
| Desktop·나 | **레이아웃 일치** — 사이드바+본문 620 중앙 1열, 우측 패널 없음. 프로필 카드→요약 2칸→설정 순서도 캔버스와 동일. (차이: 캔버스에는 없던 "출국일" 설정 행이 하나 더 있는데, 이건 discussion.md 10절에서 별도로 승인된 기능이라 결함이 아니다. "알림"도 캔버스는 예시값을, 실제는 미구현이라 "준비 중"으로 정직하게 표시 — 결함 아님.) |
| Tablet·할 일 | **레이아웃 일치** — 태블릿에서 제목이 이미 커져 있는 것을 포함해 캔버스와 동일(18.3절 정정의 근거). |
| 참고 | 모든 실제 앱 스크린샷 좌측 하단에 검은 원형 "N" 배지가 보이는데, 이는 Next.js 개발 모드 툴바이며 실제 화면 요소가 아니다(프로덕션 빌드에는 없음) — 차이점으로 셀 것이 아니다. |

### 결론

29절 전체 결함 없음. PM이 보고했던 "할 일 화면 메모 패널 잔존"은 PM의 자체 재현 스크립트 오류(탭 배지 텍스트 때문에 클릭 매칭 실패 후 조용히 홈에 머문 상태를 측정)였고, 실제 구현에는 그 결함이 없었다는 PM의 정정과 일치하는 결과를 독립적으로 재확인했다. 반대로 QAPlan.md 시나리오 자체의 기대값 오류 2건(TPC-26 측정 대상, TPC-28 태블릿 제목 크기)은 이번 실행에서 처음 발견해 정정했다.

---

## 19. 정리(cleanup)

이번 QA 실행(최초 실행 + D-1/D-2 재검증 + FONT-01~10 재검증 + RESP-01~24·FONT-11~15 재검증 + FONT-09 최종 재검증 + Button·Chip-선택 미리보기 카드 실측 + 파일 저장 KEY-01~04 부분 실행 + 메모 기능·SourceLink 스킴 검사·FONT-16 + 반응형 태블릿·PC(TPC), 총 아홉 차례)을 위해 임시로 만든 것들이며, **매번 작업 종료 시 삭제**했다.

- 스크래치 디렉터리에 `apt-get download`로 받은 `libnspr4`/`libnss3`/`libasound2t64` deb 3개와 `dpkg -x`로 푼 사본(`qa-libs/`)
- 스크래치 디렉터리에 별도 설치한 `playwright-core`와 테스트 스크립트·스크린샷 일체(`qa-driver/`)
- **`src/Front/common/data/tasks.ts`를 SRC-19 재현을 위해 한 줄(au-visa `sourceUrl`) 잠깐 `http://`로 바꿨다가 확인 직후 즉시 원복**했다. `git diff`로 그 파일에 다른 변경이 남지 않았음을 확인했다.
- 프로젝트 소스에는 그 외 아무것도 추가하거나 변경하지 않았다(dev 서버 실행 상태만 남아 있으며, 필요 시 종료 처리한다).
