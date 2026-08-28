# Wabi design-sync 메모

## 이 저장소의 특이사항

- **`dist`가 없습니다.** Wabi는 `private: true`인 Next.js 앱이라 라이브러리 진입점(`main`/`module`/`exports`)도 빌드 산출물도 없습니다. 변환기는 `src/Front/common/component`에서 진입점을 합성하는 모드(`[NO_DIST]`)로 동작하며, 이게 정상입니다. `--entry`를 주지 마세요.
- **`node_modules/wabi` 자기 참조 링크가 필요합니다.** 변환기가 `node_modules/<pkg>/package.json`을 읽는데 npm은 자기 자신을 설치하지 않습니다. 없으면 `ENOENT ... node_modules/wabi/package.json`으로 죽습니다.
  ```sh
  ln -sfn "$PWD" node_modules/wabi
  ```
- **esbuild 설치 후 `npm approve-scripts esbuild`가 필요합니다.** 이 환경의 npm이 postinstall을 기본 차단해서, 승인하지 않으면 esbuild 바이너리가 없어 번들이 실패합니다.
  ```sh
  (cd .ds-sync && npm i esbuild ts-morph @types/react && npm approve-scripts esbuild && npm rebuild esbuild)
  ```

## 스타일 진입점은 생성물입니다 — 손으로 고치지 마세요

`cfg.cssEntry`가 가리키는 `.design-sync/ds-styles.css`는 **`.design-sync/build-styles.mjs`가 `app/globals.css`에서 생성**합니다. 매 빌드 전에 실행하세요.

```sh
node .design-sync/build-styles.mjs && node .ds-sync/package-build.mjs ...
```

왜 생성하는가: 변환기가 `cssEntry` 안의 **상대 `@import`를 인라인하지 않습니다.** 처음에 `@import "../app/globals.css"`로 참조했더니 globals.css 내용이 통째로 빠져서 리셋·시트 키프레임(`wabiSheetUp` 등)·폼 요소 서체 상속 규칙이 번들에 실리지 않았고, 미리보기의 모든 버튼이 브라우저 기본 폰트로 렌더됐습니다. 손으로 복사해 두면 원본이 바뀔 때 조용히 어긋나므로 생성 방식으로 바꿨습니다.

생성기가 덧붙이는 것은 두 가지입니다. 앱에서는 런타임이 채우지만 미리보기에는 없는 값들입니다.
1. `:root`의 라이트 팔레트 — 앱은 `layout.tsx`가 `<html data-theme="light">`를 박지만 카드는 `data-theme` 없는 루트에 렌더됩니다.
2. `--font-body` / `--font-mono` — `next/font/google`이 `<html>` className으로 주입하던 변수입니다.

## 폰트는 `.next`에서 옵니다 — 먼저 앱을 빌드하세요

`cfg.extraFonts`가 `.design-sync/fonts/wabi-fonts.css`를 가리키고, 그 안의 `url()`이 **`.next/static/media/*.woff2`를 상대경로로 참조**합니다. `.next`는 gitignore 대상이라 새로 클론한 저장소에는 없습니다. 동기화 전에 `npm run dev`나 `npm run build`를 한 번 돌려 `.next/static/media`가 채워져 있어야 합니다.

`wabi-fonts.css` 자체는 개발 서버가 내려주는 next/font CSS 청크에서 `@font-face` 규칙만 뽑아 URL을 로컬 상대경로로 바꿔 만든 것입니다. 폰트 구성(굵기·서브셋)이 바뀌면 다시 뽑아야 합니다.

**원격 `@import`(Google Fonts)를 쓰지 마세요.** 캡처 환경에서 로드되지 않아 한글이 전부 두부(□)로 깨집니다. 처음에 그렇게 했다가 발견했습니다.

## 헤드리스 브라우저 (렌더 검증용)

`~/.cache/ms-playwright`에 `chromium-1234`가 이미 있고, 이 빌드를 고정하는 릴리스는 **playwright 1.62.1**입니다. 브라우저는 다시 받을 필요가 없습니다.

```sh
(cd .ds-sync && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright@1.62.1)
```

시스템 공유 라이브러리가 없고 sudo가 안 됩니다. 루트 권한 없이 푸는 방법입니다.

```sh
mkdir -p .design-sync/.cache/chromium-libs && cd $_
apt-get download libnspr4 libnss3 libasound2t64
for d in *.deb; do dpkg -x "$d" root; done
export LD_LIBRARY_PATH="$PWD/root/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"
```

`package-validate.mjs`와 `package-capture.mjs`를 돌릴 때 이 `LD_LIBRARY_PATH`가 걸려 있어야 합니다.

## 알려진 렌더 경고 (Known render warns)

현재 없습니다. 마지막 검증은 경고 0건으로 통과했습니다. `[GRID_OVERFLOW]`는 `cfg.overrides`의 `cardMode`로 모두 해소했습니다. `ListRow`·`NextActionCard`·`TabBar`·`SourceLink`·`TextField`는 `column`, `BottomSheet`는 `single`(`primaryStory: WithFooter`)입니다.

## 이 동기화가 찾아낸 제품 결함

미리보기를 실제로 렌더한 덕분에 앱 자체의 서체 결함 세 건이 드러났습니다. 모두 수정되었고 `Docs/State/Problem.md`의 P-07·P-08에 기록되어 있습니다.

1. `globals.css`가 `font-family`를 `body`에만 걸어 모든 `<button>`이 Arial로 렌더됨
2. `Chip`이 한글 라벨에 `--font-mono`를 씀 (JetBrains Mono에 한글 글리프 없음)
3. `SourceLink`가 한글 "출처" 라벨까지 mono로 렌더

**교훈**: 한글 폰트가 설치된 환경에서는 OS 대체 서체로 조용히 어긋날 뿐 깨지지 않아 육안으로 발견되지 않습니다. 폰트가 없는 컨테이너에서 렌더하면 두부로 드러납니다. `--font-mono`는 숫자·라틴 문자에만 쓰고, 한글이 섞이면 그 부분만 분리하세요.

## 앱과 번들의 의도된 차이: 폰트 대체 스택

앱과 번들의 `--font-body` 값이 한 단계 다릅니다. 결함이 아니라 구조상의 차이입니다.

```
앱   : "Noto Sans KR", "Noto Sans KR Fallback", system-ui, sans-serif
번들 : "Noto Sans KR", system-ui, sans-serif
```

`Noto Sans KR Fallback`은 `next/font/google`이 자동 생성하는 **지표 보정용 폴백**입니다. `url()` 없이 `local()`과 `size-adjust`로만 정의되어 웹폰트가 로드되기 전 글자 밀림(layout shift)을 줄이는 역할만 합니다. 실제 글리프를 담은 파일이 아니라 변환기의 폰트 복사 대상에서 빠졌고, 이름만 스택에 넣으면 존재하지 않는 패밀리라 그대로 통과됩니다.

번들은 폰트 파일을 로컬로 함께 싣기 때문에 로드가 즉시 끝나 이 폴백의 효용이 사실상 없습니다. 그래서 맞추지 않고 두었습니다.

**QA에 주는 함의**: 미리보기 카드에서 서체를 측정할 때 판정 기준을 앱의 `body`가 아니라 **카드 자체의 `body`**로 잡아야 합니다. 앱 문자열과 대조하면 이 한 단계 차이 때문에 없는 결함이 잡힙니다.

## Re-sync 위험 목록

- **`.next` 의존** — 폰트가 `.next/static/media`를 참조합니다. 앱을 빌드하지 않은 새 클론에서는 `[FONT_DANGLING]`이 뜹니다. 앱을 먼저 빌드하세요.
- **폰트 파일명 해시** — next/font가 만드는 파일명은 빌드마다 바뀔 수 있습니다. 폰트가 깨지면 `wabi-fonts.css`를 개발 서버에서 다시 뽑으세요.
- **`ds-styles.css`는 생성물** — 직접 고친 내용은 다음 빌드에 날아갑니다. `app/globals.css`나 `build-styles.mjs`를 고치세요.
- **PC 반응형이 보류 상태** — `Project-plan/discussion.md` 11절이 보류 중입니다. 재개되면 컴포넌트 CSS가 바뀌어 미리보기 렌더가 달라질 수 있습니다.
- **`componentSrcMap`이 10종을 전부 명시** — 공통 컴포넌트를 추가하면 여기에도 넣어야 동기화됩니다. 합성 모드라 `.d.ts` 자동 발견에 기댈 수 없습니다.
- **한글 콘텐츠 검증 불가** — 이 컨테이너에는 한글 시스템 폰트가 없습니다. 번들이 폰트를 싣고 있어 카드는 정상이지만, 폰트를 싣지 않는 실험을 하면 두부가 됩니다. 그건 환경 문제이지 결함이 아닙니다.
