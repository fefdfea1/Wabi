"use client";

import { useRef } from "react";
import { ThemeToggle } from "@/Front/common/theme/ThemeToggle";
import { AVATAR_ACCEPT } from "@/Front/common/storage/avatar";
import { openDatePicker } from "@/Front/common/dom/openDatePicker";
import type { Country } from "@/Front/common/types/domain";
import styles from "./MeScreen.module.css";

export interface MeScreenProps {
  country: Country | null;
  onOpenCountryPicker: () => void;
  doneCount: number;
  total: number;
  noteCount: number;
  departureDate: string | null;
  departureLabel: string | null;
  visaExpiryLabel: string | null;
  showVisaLine: boolean;
  onDepartureDateChange: (iso: string) => void;
  avatarUrl: string | null;
  onAvatarChange: (file: File) => void;
  onAvatarClear: () => void;
}

/**
 * 나 화면. 모바일은 국가·출국일·비자 만료 3줄 + 설정(discussion.md 5절, 10절) 그대로다.
 * 태블릿·데스크톱은 캔버스 06절 목업대로 아바타가 있는 프로필 카드 + 요약 두 칸(준비
 * 진행률·저장한 메모)이 붙는다 — 둘 다 다른 화면에 이미 있는 값을 옮겨 놓은 것뿐이라
 * "정보를 추가하지 않는다" 확장 규칙에 어긋나지 않는다. 조건부 렌더 대신 두 형태를 모두
 * 렌더하고 CSS로만 보이는 쪽을 바꾼다(TabBar와 같은 방식).
 *
 * discussion.md 20.5절: "정보 수정" 버튼은 없앴다(눌렀을 때 출국일 달력이 열리는 것이 이름과
 * 맞지 않았다). 대신 아바타 자체를 누르면 프로필 사진을 바꿀 수 있다.
 */
export function MeScreen({
  country,
  onOpenCountryPicker,
  doneCount,
  total,
  noteCount,
  departureDate,
  departureLabel,
  visaExpiryLabel,
  showVisaLine,
  onDepartureDateChange,
  avatarUrl,
  onAvatarChange,
  onAvatarClear,
}: MeScreenProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const departureDateInputRef = useRef<HTMLInputElement>(null);

  // 아바타 이니셜: 사진이 없을 때, 데이터에 근거를 둔 값이 필요해 국가 라벨의 첫 글자를 쓴다.
  const avatarInitial = country?.label.charAt(0) ?? "";

  return (
    <div className={styles.screen}>
      {/* discussion.md 20.7절: 탭 라벨이 프로필로 바뀌었으니 화면 제목도 맞춘다(탭 id는 20.4절대로 me 그대로). */}
      <h1 className={styles.title}>프로필</h1>

      {/* 모바일 전용 3줄 표시. discussion.md 20.5절/20.13절 5번: 출처 링크는 데스크톱 프로필
          카드뿐 아니라 여기(모바일)에서도 지운다. */}
      <section className={styles.infoLines}>
        {country ? (
          <p className={styles.infoCaption}>{country.label} 워킹홀리데이</p>
        ) : (
          <p className={styles.infoEmpty}>등록된 국가 정보가 없습니다.</p>
        )}
        {departureLabel ? (
          <p className={styles.infoDepart}>{departureLabel} 출국</p>
        ) : (
          <p className={styles.infoEmpty}>출국일을 입력하면 표시됩니다.</p>
        )}
        {showVisaLine ? (
          <p className={styles.infoVisa}>
            {visaExpiryLabel ? `비자 만료 ${visaExpiryLabel}` : "출국일을 입력하면 표시됩니다."}
          </p>
        ) : null}
      </section>

      {/* 태블릿·데스크톱 전용 프로필 카드(캔버스 06절) */}
      <section className={styles.profileCard}>
        <div className={styles.avatarWrap}>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={() => avatarInputRef.current?.click()}
            aria-label="프로필 사진 바꾸기"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={styles.avatarImage} />
            ) : (
              <span aria-hidden="true">{avatarInitial}</span>
            )}
          </button>
          {avatarUrl ? (
            <button
              type="button"
              className={styles.avatarClear}
              onClick={onAvatarClear}
              aria-label="프로필 사진 지우기"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
          <input
            ref={avatarInputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            className={styles.avatarFileInput}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAvatarChange(file);
              event.target.value = "";
            }}
          />
        </div>
        <div className={styles.profileTexts}>
          {country ? (
            <p className={styles.infoCaption}>{country.label} 워킹홀리데이</p>
          ) : (
            <p className={styles.infoEmpty}>등록된 국가 정보가 없습니다.</p>
          )}
          {departureLabel ? (
            <p className={styles.profileDepart}>{departureLabel} 출국</p>
          ) : (
            <p className={styles.infoEmpty}>출국일을 입력하면 표시됩니다.</p>
          )}
          {showVisaLine ? (
            <p className={styles.infoVisa}>
              {visaExpiryLabel ? `비자 만료 ${visaExpiryLabel}` : "출국일을 입력하면 표시됩니다."}
            </p>
          ) : null}
        </div>
      </section>

      {/* 태블릿·데스크톱 전용 요약 두 칸 — 홈/메모 화면에 이미 있는 값을 옮겨 놓은 것뿐이다 */}
      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>준비 진행률</span>
          <span className={styles.statValue}>
            {doneCount} / {total}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>저장한 메모</span>
          <span className={styles.statValue}>{noteCount}</span>
        </div>
      </section>

      <section className={styles.settings}>
        <p className={styles.settingsHeading}>설정</p>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>화면 모드</span>
          <ThemeToggle />
        </div>

        <div className={styles.settingRowStatic}>
          <span className={styles.settingLabel}>알림</span>
          <span className={styles.settingValue}>준비 중</span>
        </div>

        <button type="button" className={styles.settingRowButton} onClick={onOpenCountryPicker}>
          <span className={styles.settingLabel}>국가 변경</span>
          <span className={styles.settingValue}>{country ? `${country.label} ›` : "선택하기 ›"}</span>
        </button>

        {/* discussion.md 19.8절/20.11절/20.12절: 값 텍스트만이 아니라 행 전체가 클릭 대상이어야
            한다. label만으로는 포커스만 줄 뿐 네이티브 날짜 입력의 달력을 열지 않아 showPicker()를
            직접 호출한다. 입력은 1×1로 클립하지 않고 행 전체를 덮되 opacity:0으로 안 보이게
            한다 — 클립해 1×1 점으로 줄이면 브라우저가 그 점 위치에 달력 팝업을 띄워 라벨을
            덮어버린다(PM 실측 규명). 행 전체 크기를 유지해야 팝업이 행 아래로 열린다. */}
        <label className={styles.settingRowDate} htmlFor="me-departure-date">
          <span className={styles.settingLabel}>출국일</span>
          <span className={styles.settingValue}>{departureLabel ? departureLabel : "입력하기 ›"}</span>
          <input
            ref={departureDateInputRef}
            id="me-departure-date"
            type="date"
            className={styles.dateInput}
            aria-label="출국일 선택"
            value={departureDate ?? ""}
            onClick={(event) => openDatePicker(event.currentTarget)}
            onChange={(event) => {
              if (event.target.value) onDepartureDateChange(event.target.value);
            }}
          />
        </label>
      </section>
    </div>
  );
}
