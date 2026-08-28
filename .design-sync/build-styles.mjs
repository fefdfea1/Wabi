// .design-sync/ds-styles.css (cfg.cssEntry) 를 app/globals.css 에서 생성한다.
//
// 왜 생성하는가: 변환기가 cssEntry 안의 상대 @import 를 인라인하지 않는다. ds-styles.css 에서
// "../app/globals.css" 를 @import 하면 그 내용이 통째로 빠져 리셋·키프레임·폼 요소 상속 규칙이
// 번들에 실리지 않는다. 손으로 복사해 두면 원본이 바뀔 때 조용히 어긋나므로 매 빌드 전에 생성한다.
//
// 실행: node .design-sync/build-styles.mjs   (package-build.mjs 보다 먼저)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const globals = readFileSync(join(here, '..', 'app', 'globals.css'), 'utf8');

// 앱에서는 런타임이 채워 주지만 미리보기와 에이전트가 렌더하는 화면에는 없는 두 가지를 보충한다.
//  1) 색상 토큰 — 앱은 layout.tsx 가 <html data-theme="light"> 를 박아 [data-theme] 블록이 걸리지만,
//     카드는 data-theme 없는 루트에 렌더되어 토큰이 하나도 해석되지 않는다.
//  2) 폰트 변수 — next/font/google 이 <html> className 으로 주입하던 --font-body / --font-mono.
const additions = `
/* ===== design-sync 전용 보충 (build-styles.mjs 가 덧붙임) ===== */
:root {
  --bg: #f4f4f3;
  --surface: #ffffff;
  --sunken: #ededeb;
  --line: #e2e2df;
  --muted: #a5a8a3;
  --text: #6b6e6a;
  --strong: #121312;
  --ink: #121312;
  --on-ink: #ffffff;
  --alert: #a6382b;

  --font-body: "Noto Sans KR";
  --font-mono: "JetBrains Mono";
}
`;

const header = `/* 생성된 파일 — 직접 고치지 마세요. app/globals.css 를 고치고 build-styles.mjs 를 다시 실행하세요. */\n`;
writeFileSync(join(here, 'ds-styles.css'), header + globals + additions);
console.log('ds-styles.css 생성 완료 (globals.css ' + globals.split('\n').length + '줄 + 보충)');
