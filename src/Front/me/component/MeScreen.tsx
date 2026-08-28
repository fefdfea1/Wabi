"use client";

import { useRef } from "react";
import { SourceLink } from "@/Front/common/component/SourceLink";
import { ThemeToggle } from "@/Front/common/theme/ThemeToggle";
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
}

/**
 * 나 화면. 모바일은 국가·출국일·비자 만료 3줄 + 설정(discussion.md 5절, 10절) 그대로다.
 * 태블릿·데스크톱은 캔버스 06절 목업대로 아바타가 있는 프로필 카드 + 요약 두 칸(준비
 * 진행률·저장한 메모)이 붙는다 — 둘 다 다른 화면에 이미 있는 값을 옮겨 놓은 것뿐이라
 * "정보를 추가하지 않는다" 확장 규칙에 어긋나지 않는다. 조건부 렌더 대신 두 형태를 모두
 * 렌더하고 CSS로만 보이는 쪽을 바꾼다(TabBar와 같은 방식).
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
}: MeScreenProps) {
  const settingsRef = useRef<HTMLDivElement>(null);

  function scrollToSettings() {
    settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 아바타 이니셜: 데이터에 근거를 둔 값이 필요해 국가 라벨의 첫 글자를 쓴다.
  const avatarInitial = country?.label.charAt(0) ?? "";

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>나</h1>

      {/* 모바일 전용 3줄 표시 */}
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
        {visaExpiryLabel ? <SourceLink url={country?.sourceUrl} /> : null}
      </section>

      {/* 태블릿·데스크톱 전용 프로필 카드(캔버스 06절) */}
      <section className={styles.profileCard}>
        <span className={styles.avatar} aria-hidden="true">
          {avatarInitial}
        </span>
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
          {visaExpiryLabel ? <SourceLink url={country?.sourceUrl} /> : null}
        </div>
        <button type="button" className={styles.editButton} onClick={scrollToSettings}>
          정보 수정
        </button>
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

      <section className={styles.settings} ref={settingsRef}>
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

        <div className={styles.settingRowDate}>
          <span className={styles.settingLabel}>출국일</span>
          <span className={styles.settingValue}>{departureLabel ? departureLabel : "입력하기 ›"}</span>
          <input
            type="date"
            className={styles.dateInput}
            aria-label="출국일 선택"
            value={departureDate ?? ""}
            onChange={(event) => {
              if (event.target.value) onDepartureDateChange(event.target.value);
            }}
          />
        </div>
      </section>
    </div>
  );
}
