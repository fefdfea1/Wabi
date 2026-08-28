---
title: Wabi 기술 스펙 (TechSpec)
description: Architecture가 discussion.md와 WabiDesignSystem.dc.html을 검토하여 결정한 스타일링·다크모드·폴더 구조·렌더링 방식과 근거
---

## 0. 확인 방법 (근거 출처)

이 문서의 수치·권장 방식은 다음 1차 출처를 직접 열어 확인했습니다. 기억이나 추정으로 채운 값은 없습니다.

- **Next.js/React 버전**: `https://registry.npmjs.org/next/latest`, `https://registry.npmjs.org/react/latest` (npm 공식 레지스트리 API)를 직접 조회
- **App Router 다크모드 깜빡임 공식 권장 방식**: 형제 프로젝트 SoundChain에 실제로 설치된 `next` 패키지가 포함한 로컬 공식 문서 `SoundChain/node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`를 직접 읽음. SoundChain의 `AGENTS.md`가 "이 Next.js 버전은 학습 데이터와 다를 수 있으니 `node_modules/next/dist/docs/`의 문서를 신뢰하라"고 명시하고 있어, 기억에 의존하지 않고 이 로컬 문서를 1차 출처로 채택했습니다. 이후 `https://nextjs.org/docs/app/guides/preventing-flash-before-hydration` 원문도 bash `curl`로 직접 열어(WebFetch 도구는 DNS 타임아웃으로 실패했으나, PM 확인대로 `curl -s -o /dev/null -w %{http_code}`는 200을 반환했고 브라우저 User-Agent를 붙인 `curl -A`로도 정상 응답함 — 사이트·네트워크 문제가 아니라 조사 도구 쪽의 실패였음) 원문 HTML을 대조했습니다. Themes 절의 테마 초기화 스크립트 원문(`localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)...`)이 로컬 문서와 글자 하나까지 일치함을 확인했습니다.
- **CSS 방식 공식 권장**: 같은 경로의 `01-app/01-getting-started/11-css.md`, `01-app/02-guides/css-in-js.md`
- **렌더링 모델**: 같은 경로의 `01-app/02-guides/rendering-philosophy.md` (이 버전은 SSG/SSR을 라우트 단위 이분법이 아니라 컴포넌트 단위 스펙트럼으로 다룹니다 — 6절 참고)
- **형제 프로젝트 폴더 구조·의존성**: `SoundChain/package.json`, `SoundChain/tsconfig.json`, `SoundChain/next.config.ts`, `SoundChain/app/`, `SoundChain/src/` 를 `find`/`Read`로 직접 확인 (2026-08-28 기준)

---

## 1. 최종 결정 요약

| 항목 | 결정 |
|---|---|
| Next.js | **^16.3.3** (npm 최신 안정판, 2026-08-28 확인) |
| React | **^19.2.8** (npm 최신 안정판, 2026-08-28 확인) |
| 렌더링 | App Router, 전 화면 정적 프리렌더(SSG 성격) + 클라이언트 상태. 서버·DB 없음(discussion.md 9절에서 이미 확정) |
| 스타일링 | **CSS Modules + CSS 커스텀 프로퍼티(디자인 토큰)** |
| 다크모드 | **CSS 변수 + `data-theme` 어트리뷰트 + 인라인 스크립트**(Next.js 공식 가이드 패턴), `localStorage` 저장 |
| 폴더 구조 | `src/Front`(+ 필요 시 최소한의 `app/`), `src/Back` 미생성(백엔드 없음), `common/component`·`common/types`·`common/data`·`common/theme`·`common/storage` 분리 |
| 문서/파일 저장 (다음 차수) | **IndexedDB에 Blob 직접 저장**, 서버 업로드 없음. `Docs/State/SecurityReview.md` 3절 반영(6절 참고) |

이번 4가지 결정 모두 discussion.md 9절에서 이미 승인된 범위("백엔드·유료 서비스 없음, Next.js App Router, 클라이언트 상태만") 안에 있으므로, Architecture.md의 "우선 고려 기술 스택 이탈" 승인 절차가 별도로 필요하지 않습니다. 표의 마지막 행(문서/파일 저장)은 이 4가지와 별도로, 파일 추가 시트 구현 착수 전에 Security 검토를 반영해 추가한 결정입니다(6절). IndexedDB 역시 브라우저 내장 API이고 서버·유료 서비스를 도입하지 않으므로 같은 승인 범위 안에 있습니다.

---

## 2. 스타일링 방식

### 대안 비교

| 대안 | 장점 | 단점 | 이 프로젝트 적합도 |
|---|---|---|---|
| **CSS Modules + CSS 커스텀 프로퍼티** | 클래스명 충돌 없이 로컬 스코프. `--bg`, `--ink` 같은 CSS 변수로 라이트/다크 토큰을 선언하면 JS 없이 `[data-theme]` 선택자만으로 전체 팔레트가 즉시 전환됨. 별도 런타임·빌드 플러그인 불필요. **형제 프로젝트 SoundChain이 이미 이 방식을 쓰고 있음**(`Button.module.css` 등 확인) | 유틸리티 클래스 대비 타이핑량이 많음(디자인 시스템이 작으므로 이 프로젝트에선 단점이 작음) | **채택** |
| Tailwind CSS | Next.js 공식 CSS 가이드가 "대부분의 스타일링에는 Tailwind를 우선 사용"이라고 권장(11-css.md, "Recommendations" 절). 유틸리티 클래스로 빠른 작업 | 이 프로젝트는 유채색 팔레트가 사실상 없고(무채색 8단계 + alert 1개) 값이 고정된 디자인 토큰 시스템이라, 임의 값을 조합하는 유틸리티 클래스의 이점이 작음. 신규 의존성(`tailwindcss`, `@tailwindcss/postcss`) 추가 | 기각 — 팔레트가 사실상 고정 토큰 8+1개뿐이라 유틸리티 클래스의 장점(임의 조합)을 거의 못 씀 |
| CSS-in-JS (styled-components, vanilla-extract 등) | 컴포넌트와 스타일을 한 파일에 응집 | 공식 문서(css-in-js.md)에 따르면 App Router에서는 **Client Component에서만 지원**되며, 스타일 레지스트리 + `useServerInsertedHTML` 훅으로 3단계 설정을 직접 해야 함(RSC 스트리밍과 상충하는 라이브러리도 있음). Front-end.md 규칙("최상단 page.tsx엔 use client 금지")과 결이 맞지 않고, 이 규모 앱에 과도한 엔지니어링 | 기각 — 설정 비용이 이 프로젝트 규모에 비해 큼 |

### 결정: CSS Modules + CSS 커스텀 프로퍼티

- discussion.md 3.1절의 색상 토큰(`bg`/`surface`/`sunken`/`line`/`muted`/`text`/`strong`/`ink`/`onInk`/`alert`)을 `app/globals.css`에 CSS 커스텀 프로퍼티로 그대로 옮깁니다. 라이트/다크 각각의 값 10개는 이미 표로 확정되어 있어 임의 조합이 필요 없고, 그대로 옮겨 적으면 되므로 Tailwind의 유틸리티 조합 이점이 발휘되지 않습니다.
- 컴포넌트별 스타일(`Button.module.css`, `ListRow.module.css` 등)은 SoundChain과 동일한 패턴으로, `var(--ink)`처럼 토큰을 참조합니다.
- 공식 CSS 가이드의 "Global CSS는 정말 전역적인 것에만, 컴포넌트별 커스텀 스코프 스타일은 CSS Modules에"라는 권장과도 일치합니다.

---

## 3. 다크모드 적용 방식

### 대안 비교

| 대안 | 장점 | 단점 |
|---|---|---|
| **CSS 변수 + `data-theme` + 인라인 스크립트**(Next.js 공식 가이드) | 토큰 전환이 CSS 선택자 하나로 끝남. 다크모드 전환 시 리렌더 없음. Next.js 공식 문서가 이 정확한 패턴(테마용 예제)을 제공함 | `<html>`에 `suppressHydrationWarning` 필요, 개발 모드에서 Strict Mode 리마운트로 속성이 지워지는 것을 `useLayoutEffect`로 재적용해야 함(공식 문서에 해결책 명시) |
| JS 테마 객체(Context로 `{ bg:'#...', ink:'#...' }` 전달, WabiDesignSystem.dc.html 캔버스가 실제로 이렇게 함) | 캔버스 프로토타입과 구현 방식이 1:1로 대응돼 참고하기 쉬움 | 캔버스는 **정적 목업이라 SSR/하이드레이션 문제가 아예 없는 환경**(단일 HTML 파일, 커스텀 `x-dc` 프레임워크)이라 이 방식을 그대로 씀. Next.js SSR 환경에서 JS 객체로 테마를 내려주면 테마를 쓰는 모든 컴포넌트가 Context를 구독해야 하고, 서버 렌더 시점엔 사용자의 저장된 선택을 알 수 없어 첫 페인트에 잘못된 테마가 그려진 뒤 깜빡이며 바뀜(정확히 공식 문서가 경고하는 문제) | 기각 — SSR 환경의 초기 깜빡임 문제를 스스로 해결해야 해서 공식 패턴보다 복잡함 |

### 결정: CSS 변수 + `data-theme` + 인라인 스크립트 (Next.js 공식 가이드 그대로)

`node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` "Themes" 절에서 직접 확인한 패턴입니다.

```tsx
// app/layout.tsx (Server Component, use client 없음)
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* app/globals.css */
[data-theme='light'] { --bg:#F4F4F3; --surface:#FFFFFF; --ink:#121312; --on-ink:#FFFFFF; /* ... discussion.md 3.1 표 그대로 */ }
[data-theme='dark']  { --bg:#0E0F0E; --surface:#171918; --ink:#F2F3F1; --on-ink:#0E0F0E; /* ... */ }
```

- **쿠키 대신 `localStorage`를 씁니다.** 공식 문서는 서버가 `cookies()`로 테마를 읽어 SSR에 반영해야 할 때만 쿠키를 권장합니다. Wabi는 서버 렌더링 시점에 사용자별로 다른 HTML을 만들 필요가 전혀 없는(전 화면 정적 프리렌더) 구조이므로, 더 단순한 `localStorage` + 인라인 스크립트만으로 충분합니다. 쿠키 파싱을 추가하는 것은 이 범위에서 과도한 엔지니어링입니다.
- **개발 모드 주의**: 같은 문서의 "Re-applying attributes in development" 절에 따르면 React Strict Mode의 리마운트가 인라인 스크립트가 설정한 속성을 지웁니다. '나' 탭의 테마 토글 컴포넌트(`use client`)에서 `useLayoutEffect`로 같은 값을 재적용하는 코드를 두어야 합니다(프로덕션 빌드에서는 no-op). Frontend 구현 시 반드시 반영해야 합니다.
- 캔버스의 `dark ? ... : ...` 인라인 스타일 전환 로직은 **디자인 참고용**일 뿐, 그대로 포팅하면 안 됩니다. 색상 값 자체(라이트/다크 각 10개)만 CSS 변수로 그대로 옮기고, 전환 메커니즘은 위 공식 패턴을 따릅니다.

---

## 4. 폴더 구조

### 참고한 것

- 형제 프로젝트 SoundChain의 `find` 결과: `src/Front/{feature}/component`, `src/Front/common/{api,audio,component,session,storage,types}`, `app/[locale]/...` (경로 별칭 `@/Front/*`, `@/Back/*`는 `tsconfig.json`에서 확인)
- Front-end.md 32행: "여러 곳에서 공통으로 사용되는 컴포넌트와 타입은 확장성을 고려해 설계하고, `common` 폴더를 생성하여 `component`와 `types` 폴더로 별도 분리합니다"
- discussion.md 6절: 데이터는 화면 코드와 분리해 `src/Front/common/data`(또는 Architecture가 정한 위치)에 둠

### 결정

```
Wabi/
  app/
    layout.tsx              # Server Component. html/body, 테마 초기화 인라인 스크립트, 폰트, globals.css
    page.tsx                # Server Component. 정적 메타데이터 export, <WabiApp/> 렌더만 담당
    globals.css              # 디자인 토큰(CSS 변수) + 리셋 + 폰트 페이스
  src/
    Front/
      home/component/        # HomeScreen, NextActionCard 등 홈 전용
      tasks/component/        # TasksScreen, Segment 연동
      docs/component/         # DocsScreen
      me/component/           # MeScreen, 테마·국가 설정
      task-detail/component/  # 할 일 상세 화면
      overlay/component/      # GuideSheet, PainSheet, AddTaskSheet, AddFileSheet, BottomSheet
      common/
        component/            # Button, Chip, ListRow, ProgressBar, Segment, TabBar, TextField 등 범용 컴포넌트
        types/                # Task, Country, GuideItem, PainItem 등 공용 타입
        data/                 # TASKS, GUIDE, PAIN, COUNTRIES 상수 (discussion.md 6절)
        theme/                # ThemeToggle(use client), 테마 관련 훅
        storage/              # localStorage 읽기/쓰기 유틸(직접 추가한 할 일, 테마, 국가 등)
        app-shell/            # WabiApp(use client): 탭 상태, 오버레이 상태, 진행률 계산 등 앱 전체 상태
  tsconfig.json               # paths: "@/Front/*": ["./src/Front/*"]  (SoundChain과 동일 관례)
```

- **`src/Back`는 만들지 않습니다.** discussion.md 9절에서 이미 "서버·DB 없음"으로 확정되어 있고, SoundChain의 `src/Back`는 Supabase 연동·검증·API 응답 포맷팅을 위한 폴더인데 Wabi에는 대응하는 필요가 없습니다. 필요해지는 시점(예: 실제 파일 업로드 도입)에 Architecture가 재검토하여 PM 승인을 받습니다.
- `app/`은 라우트를 하나(`/`)만 둡니다. 캔버스 프로토타입 자체가 홈/할 일/문서/나 4개 화면을 URL 라우트가 아니라 **탭바 클릭으로 전환되는 단일 화면 상태**로 구현했고(script의 `tab` state), discussion.md 7절 "탭 이동 시 열려 있던 상세는 닫습니다"도 화면 전환이 클라이언트 상태임을 전제로 합니다. 화면마다 별도 URL 라우트를 만드는 것은 SEO 이점이 없는 상태에서(검색 노출 대상이 아닌 개인용 진행 관리 앱) 라우트 간 상태 동기화 문제만 추가하는 과도한 엔지니어링이라고 판단했습니다.
- `common` 하위를 SoundChain보다 세분화(`data`, `theme`, `storage` 추가)한 이유는 discussion.md 6절이 데이터/값을 화면 코드와 분리하라고 명시했고, 로컬 저장이 여러 화면(할 일 추가, 테마, 국가 설정)에서 공유되기 때문입니다. Front-end.md의 "공통 컴포넌트는 `common/component`, 공통 타입은 `common/types`" 규칙은 그대로 지키고, 그 위에 이 프로젝트에 필요한 하위 폴더만 얹었습니다.

---

## 5. 렌더링 방식

### 이 Next.js 버전의 렌더링 모델 (근거: rendering-philosophy.md)

확인해 보니 이번에 채택한 Next.js 16.3.3은 "라우트 단위로 SSG냐 SSR이냐를 고른다"는 전통적 이분법이 아니라, **컴포넌트 단위로 정적/동적 경계를 긋는 모델**입니다. `cookies()`/`headers()`/`searchParams` 같은 동적 API를 쓰지 않는 컴포넌트는 자동으로 정적 프리렌더(SSG와 동일한 효과) 대상이 되고, 쓰는 부분만 동적으로 남습니다. 따라서 "이 화면은 SSG, 저 화면은 SSR"이라고 라우트별로 딱 나누기보다, "어떤 컴포넌트가 서버에서 정적으로 미리 그려질 수 있는가"로 판단해야 합니다.

### 결정

| 컴포넌트/화면 | 렌더링 | 이유 |
|---|---|---|
| `app/layout.tsx` | Server Component, 정적 프리렌더 | 동적 API 미사용. 다크모드 초기 스크립트도 서버가 아니라 브라우저에서 실행되는 인라인 스크립트일 뿐, 컴포넌트 자체는 정적 |
| `app/page.tsx` | Server Component, 정적 프리렌더(SSG) | `TASKS`/`GUIDE`/`PAIN`/`COUNTRIES`는 discussion.md 6.2절에 따라 조사 완료 전까지도 빌드 타임에 고정된 상수이고, 요청마다 달라지는 서버 데이터가 없음. `metadata` export로 제목만 정적으로 설정 |
| `WabiApp`(탭 전환, 오버레이 상태, 진행률 계산 등 앱 전체 상태) | `use client` | 탭 클릭, 시트 열고 닫기 등 이벤트 핸들러와 클라이언트 전용 상태(현재 탭, 열린 시트)가 핵심 |
| `ThemeToggle`, `CountrySelector`(나 탭) | `use client` | `localStorage` 읽기/쓰기, 클릭 이벤트 |
| `AddTaskSheet`, `AddFileSheet` | `use client` | 폼 입력 상태 관리 |
| `ListRow`, `Button`, `Chip` 등 순수 표시용 컴포넌트 | 서버 컴포넌트로 작성하되 `WabiApp`(client) 아래 `children`/`props`로 전달 | Front-end.md 19행 규칙("`use client` 컴포넌트 안에 서버 컴포넌트가 들어갈 경우 반드시 props나 children으로 전달") 그대로 적용. 이 컴포넌트들 자체엔 이벤트 핸들러가 없으므로 `use client`를 붙이지 않음 |

- 서버가 없고 모든 콘텐츠가 빌드 타임에 고정되므로, 사실상 **전 화면이 정적 프리렌더 대상**입니다. `use client` 경계는 "이 컴포넌트가 브라우저 상태(탭, 시트 열림, 폼 입력, localStorage)를 직접 다루는가"만을 기준으로 최소 범위로 긋습니다.
- Front-end.md 규칙(최상단 `page.tsx`/`layout.tsx`에 `use client` 금지)을 지키기 위해, 클라이언트 상태 관리는 반드시 `page.tsx`가 감싸는 하위 컴포넌트(`WabiApp`)로 내립니다.

---

## 6. 파일 저장 방식 (파일 추가 시트, 다음 차수)

### 배경

discussion.md 9절은 "실제 파일 업로드와 기기 저장"을 이번 구현 범위에서 제외하고 다음 차수 과제로 남겨 두었습니다. 다만 캔버스(`Docs/Design/WabiDesignSystem.dc.html:454`)의 파일 추가 시트 문구 "서류는 기기에만 저장되며 만료일 알림에 사용됩니다"는 이미 사용자에게 한 약속이므로, 다음 차수 구현에 착수하기 전에 이 약속을 실제로 지킬 수 있는 저장 방식을 지금 정해 둡니다. 근거는 `Docs/State/SecurityReview.md` 3절(Security가 확인한 4가지 제약)입니다.

### 대안 비교 (저장 매체)

| 대안 | 장점 | 단점 | 적합도 |
|---|---|---|---|
| `localStorage`(base64 인코딩) | 이미 테마 저장에 쓰고 있어 코드 재사용 가능 | 문자열 전용이라 파일을 base64로 변환해야 함(용량 약 33% 증가). 브라우저별로 대략 5~10MB 한도라 사진 몇 장으로도 한도에 도달. 동기 API라 큰 문자열을 넣고 뺄 때 메인 스레드가 멈춤 | 기각 |
| **IndexedDB**(Blob/File 객체 직접 저장) | 비동기 API. 기기 여유 공간 기준 수백MB 이상까지 허용되는 것이 일반적. Blob을 그대로 저장해 base64 인코딩·디코딩 비용이 없음 | localStorage보다 API가 번거로워 래퍼(예: `idb-keyval`)가 필요 | **채택** |

### 결정: IndexedDB에 Blob 저장, 서버 업로드는 도입하지 않음

- 파일 원본(사진·PDF)은 IndexedDB에 Blob으로 저장합니다. `src/Front/common/storage`에 파일 저장 전용 유틸을 추가합니다(테마·할 일 저장과 같은 위치 원칙, 4절).
- 어떤 형태로든 파일을 외부 API·스토리지(S3, Firebase Storage, Cloudinary 등)로 전송하는 코드를 추가하지 않습니다. **파일 업로드 기능 자체가 discussion.md 9절/Architecture.md의 "백엔드·유료 서비스 도입 시 사용자 승인" 절차의 트리거입니다.** 서버 업로드가 필요하다고 판단되면 구현 전에 PM 승인을 받습니다.
- 상세 화면에서 저장된 사진·PDF를 미리 보여줄 때는 `URL.createObjectURL(blob)`로 만든 URL만 `<img>` 또는 `sandbox` 속성이 있는 `<iframe>`에 씁니다. 사용자가 고른 파일이 SVG여도 `dangerouslySetInnerHTML`이나 문서 인라인 삽입으로 미리보기를 만들지 않습니다(SVG는 내부에 `<script>`를 포함할 수 있어, 사용자 자신이 고른 파일이라도 인라인 삽입 시 앱과 같은 오리진에서 그 스크립트가 실행됩니다).
- 향후 에러 추적·애널리틱스 SDK를 추가할 때는 파일 이름(예: "여권_홍길동.pdf")이나 파일 내용이 로그 페이로드에 섞이지 않는지 확인한 뒤에만 도입합니다.
- "기기에만 저장"이라는 카피는 정확한 표현이지만 영구 보존을 뜻하지는 않습니다. 브라우저 저장 공간을 사용자가 지우거나(iOS Safari는 장기간 사용하지 않은 사이트의 저장 데이터를 자동으로 비울 수 있습니다) 앱을 재설치하면 함께 사라집니다. Frontend는 이 한계를 화면 문구로 과장하지 않고, 필요하면 설정 화면에 안내 문구 추가를 검토합니다.

---

## 7. 과도한 엔지니어링으로 판단해 제외한 것

- Tailwind, CSS-in-JS: 2절 사유로 기각
- 쿠키 기반 테마 저장, 서버 측 테마 판별: 서버가 사용자별 HTML을 만들 필요가 없어 불필요
- 화면별 URL 라우트 분리: SEO 요구가 없고 탭 전환은 클라이언트 상태로 충분
- `src/Back`, 인증, 실시간 동기화: discussion.md 9절에서 이미 범위 밖으로 확정

---

## 8. 확인 필요 (Frontend/PM 재확인 요청)

- (해결됨) 위 인라인 스크립트 패턴은 로컬 문서(SoundChain에 설치된 Next.js 16.3.3 기준)에서 확인한 것이었는데, Wabi를 실제로 스캐폴딩하며 `npm install`한 뒤 Wabi 자체의 `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`를 `diff`로 대조해 SoundChain 사본과 완전히 동일함을 확인했습니다.
- (해결됨) `nextjs.org` 웹사이트 직접 열람은 WebFetch 도구 호출 시 DNS 타임아웃으로 실패했으나, 이는 조사 도구 쪽 문제였습니다. PM 확인대로 bash `curl -s -o /dev/null -w %{http_code} https://nextjs.org`는 200을 반환했고, `https://nextjs.org/docs/app/guides/preventing-flash-before-hydration`도 브라우저 User-Agent를 붙인 `curl -A "Mozilla/5.0 ..."`로 정상 응답(200)했습니다. 받아온 원문 HTML의 Themes 절 인라인 스크립트 텍스트(`localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`)가 로컬 문서와 글자 단위로 일치함을 확인했습니다. 앞으로 웹 조회 도구가 실패하면 곧바로 "접근 불가"로 기록하지 않고, bash `curl`(필요 시 `-A`로 브라우저 User-Agent 부여)로 재시도한 뒤에도 실패할 때만 접근 불가로 기록합니다.
- Google Fonts(Noto Sans KR, JetBrains Mono) 로딩 방식은 이번 스펙에서 다루지 않았습니다. `next/font/google` 사용 여부는 Frontend 구현 시 결정해도 되는 범위로 판단해 이번 4가지 결정에서 제외했습니다.

---

## 9. 다음 단계

Frontend는 이 문서와 `Agent-Prompts/Front-end.md`를 함께 따라 구현합니다. 3절(다크모드) 구현 시 개발 모드 Strict Mode 재마운트 이슈(`useLayoutEffect` 재적용)를 놓치지 않도록 특히 주의가 필요합니다. discussion.md 6.2절(조사 전 데이터)은 Research-team 산출물이 도착하기 전까지 데이터 구조와 화면만 구현하고 값은 비워둡니다. 파일 추가 시트(다음 차수) 구현 착수 시에는 6절의 IndexedDB·서버 업로드 금지·SVG 인라인 미리보기 금지 제약을 그대로 따릅니다.


---

## 부록. 런타임 의존성 현황 (2026-08-28 갱신)

| 패키지 | 버전 | 쓰임 |
|---|---|---|
| `next` | 16.3.3 | App Router, 정적 프리렌더 |
| `react` / `react-dom` | 19 계열 | UI |
| `@vercel/analytics` | `^2.0.1` | 방문 집계(`app/layout.tsx`의 `<Analytics />`) |

`@vercel/analytics`는 외부로 데이터를 보내는 **첫 의존성**입니다. `SecurityReview.md` 부록에 도입 전 확인 결과를 남겼습니다. 그 확인은 앱의 라우트가 `/` 하나뿐이라는 사실에 기대고 있으므로, 라우트를 늘릴 때 다시 검토해야 합니다.

API 키가 필요한 SDK는 여전히 없습니다.
