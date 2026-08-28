import { SourceLink } from "@/Front/common/component/SourceLink";
import { ThemeToggle } from "@/Front/common/theme/ThemeToggle";
import type { Country, CountryCode } from "@/Front/common/types/domain";
import styles from "./MeScreen.module.css";

export interface MeScreenProps {
  countries: Country[];
  country: Country | null;
  countryPickerOpen: boolean;
  onToggleCountryPicker: () => void;
  onSelectCountry: (code: CountryCode) => void;
  departureDate: string | null;
  departureLabel: string | null;
  visaExpiryLabel: string | null;
  showVisaLine: boolean;
  onDepartureDateChange: (iso: string) => void;
}

/** 나 화면. 국가·출국일·비자 만료 3줄 + 설정(화면 모드/알림/국가 변경/출국일)을 둔다(discussion.md 5절, 10절). */
export function MeScreen({
  countries,
  country,
  countryPickerOpen,
  onToggleCountryPicker,
  onSelectCountry,
  departureDate,
  departureLabel,
  visaExpiryLabel,
  showVisaLine,
  onDepartureDateChange,
}: MeScreenProps) {
  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>나</h1>

      <section className={styles.infoCard}>
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

      <section className={styles.settings}>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>화면 모드</span>
          <ThemeToggle />
        </div>

        <div className={styles.settingRowStatic}>
          <span className={styles.settingLabel}>알림</span>
          <span className={styles.settingValue}>준비 중</span>
        </div>

        <button type="button" className={styles.settingRowButton} onClick={onToggleCountryPicker} aria-expanded={countryPickerOpen}>
          <span className={styles.settingLabel}>국가 변경</span>
          <span className={styles.settingValue}>{country ? `${country.label} ›` : "선택하기 ›"}</span>
        </button>

        {countryPickerOpen ? (
          <div className={styles.countryList} role="listbox" aria-label="국가 선택">
            {countries.length === 0 ? (
              <p className={styles.countryEmpty}>등록된 국가가 없습니다.</p>
            ) : (
              countries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  role="option"
                  aria-selected={c.code === country?.code}
                  className={[styles.countryOption, c.code === country?.code ? styles.countryOptionSelected : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectCountry(c.code)}
                >
                  {c.label}
                </button>
              ))
            )}
          </div>
        ) : null}

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
