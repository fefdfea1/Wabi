# Wabi 사용 규약

워킹홀리데이 준비·정착 앱의 모바일 우선 디자인 시스템입니다. 무채색 하나로만 이루어져 있고, 강조는 색이 아니라 크기·여백·잉크 대비로 만듭니다.

## 감싸기와 설정

**프로바이더 컴포넌트가 없습니다.** 감쌀 것이 없으니 컴포넌트를 그냥 쓰면 됩니다. 색은 CSS 커스텀 프로퍼티로 오고, `styles.css`가 `:root`에 라이트 팔레트를 기본값으로 정의합니다.

다크 모드는 루트 요소에 어트리뷰트 하나를 겁니다. 다른 설정은 없습니다.

```html
<html data-theme="dark">
```

## 스타일 관용구 — CSS 변수

유틸리티 클래스가 없습니다. 클래스 이름을 지어내지 마세요. 직접 만드는 레이아웃은 아래 변수를 `var(--이름)`으로 참조합니다. 이 12개가 전부이고 새 색을 만들지 않습니다.

| 변수 | 쓰임 |
|---|---|
| `--bg` | 화면 바탕 |
| `--surface` | 카드·시트 바탕 |
| `--sunken` | 트랙·입력창처럼 눌린 면 |
| `--line` | 1px 구분선·테두리 |
| `--muted` | 보조 글자, 비활성 |
| `--text` | 본문 글자 |
| `--strong` | 제목·강조 글자 |
| `--ink` | 주 동작 배경(라이트에서 검정) |
| `--on-ink` | `--ink` 위의 글자 |
| `--alert` | 마감 임박 한 곳에만. 그 외 유채색 금지 |
| `--font-body` | 본문 서체(Noto Sans KR) |
| `--font-mono` | 숫자·라틴 캡션 서체(JetBrains Mono) |

**`--font-mono`는 숫자와 라틴 문자에만 씁니다.** JetBrains Mono에는 한글 글리프가 없어 한글에 걸면 대체 서체로 떨어집니다. 한글이 섞이는 자리는 본문 서체를 쓰고, 숫자·도메인 같은 부분만 `<span>`으로 분리해 mono를 거세요.

간격은 4px 배수(4·8·12·16·24·32)입니다. 화면 좌우 여백 20px, 블록 사이 24px, 카드 내부 20px, 리스트 행 높이 64px, 누를 수 있는 것은 최소 48×48px입니다.

시트·모달에 쓸 키프레임이 이미 있습니다: `wabiSheetUp`, `wabiFadeIn`, `wabiSlideIn`, `wabiModalIn`.

## 진짜 내용이 있는 곳

스타일을 쓰기 전에 `_ds/<folder>/styles.css`와 그것이 `@import`하는 `_ds_bundle.css`를 읽으세요. 토큰 정의와 컴포넌트 스타일이 거기 그대로 있습니다. 컴포넌트별 API는 `<Name>.d.ts`, 사용법은 `<Name>.prompt.md`입니다.

컴포넌트는 11종입니다: `BottomSheet`, `Button`, `Chip`, `ListRow`, `NextActionCard`, `ProgressBar`, `Segment`, `SourceLink`, `TabBar`, `TextArea`, `TextField`.

## 카피 규칙

존댓말로 한 문장씩 씁니다. 느낌표와 감탄사를 쓰지 않습니다. 행동 버튼은 동사로 끝냅니다("지금 하기", "가입하기"). 마감은 상대 표현으로 씁니다("오늘까지", "도착 후 3일 내").

## 예시

```jsx
<div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 20, background: "var(--bg)" }}>
  <NextActionCard
    title="워킹홀리데이 비자 신청"
    description="만 18세부터 30세까지 신청할 수 있습니다."
    ctaLabel="지금 하기"
    onAction={apply}
  />
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)" }}>
      <span>출국 전 준비</span>
      <span style={{ fontFamily: "var(--font-mono), monospace", color: "var(--strong)" }}>8 / 14</span>
    </div>
    <ProgressBar value={8} max={14} />
  </div>
  <ListRow title="건강보험 가입" meta="비자 조건 8501" done={false} urgent onToggle={toggle} onOpen={open} />
</div>
```
