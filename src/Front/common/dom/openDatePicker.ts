/**
 * discussion.md 20.11절 3번: 네이티브 날짜 입력은 포커스만으로 달력을 열지 않는다(label로
 * 감싸는 것만으로는 부족한 이유) — 반드시 showPicker()를 호출해야 하고, 이를 지원하지 않는
 * 브라우저에서는 포커스로 대체한다('나' 화면 "정보 수정" 버튼에 쓰인 것과 같은 방식).
 */
export function openDatePicker(el: HTMLInputElement | null): void {
  if (!el) return;
  if (typeof el.showPicker === "function") {
    try {
      el.showPicker();
      return;
    } catch {
      // 사용자 제스처 밖에서 호출되는 등 showPicker가 막히는 브라우저는 포커스로 대체한다.
    }
  }
  el.focus({ preventScroll: true });
}
