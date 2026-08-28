/**
 * discussion.md 20.11절 3번: 네이티브 날짜 입력은 포커스만으로 달력을 열지 않는다(label로
 * 감싸는 것만으로는 부족한 이유) — 반드시 showPicker()를 호출해야 하고, 이를 지원하지 않는
 * 브라우저에서는 포커스로 대체한다('나' 화면 "정보 수정" 버튼에 쓰인 것과 같은 방식).
 *
 * discussion.md 34.1절(PM 실측): 달력이 열린 채로 같은 입력칸을 다시 누르면 두 가지가 한
 * 프레임 안에서 연달아 일어난다 — 브라우저가 바깥 클릭으로 판단해 달력을 닫고, 그 클릭이
 * 그대로 onClick에 도달해 showPicker()가 다시 연다. 닫으려는 동작이 여는 동작이 되어
 * 깜빡인다. 이 함수가 어느 입력칸의 달력이 "우리 쪽 기록상" 열려 있는지 요소별로 기억해,
 * 이미 열려 있다고 기록된 입력칸을 다시 누르면 showPicker()를 부르지 않고 기록만 지운다
 * (브라우저가 이미 닫았으므로 그대로 닫힌 채 둔다). 호출부(onClick={(e) =>
 * openDatePicker(e.currentTarget)})는 그대로다 — 앞으로 날짜 입력이 늘어도 자동으로 같은
 * 동작을 얻는다.
 */
const openPickers = new WeakSet<HTMLInputElement>();
const listenersAttached = new WeakSet<HTMLInputElement>();

function clearOpenState(el: HTMLInputElement): void {
  openPickers.delete(el);
}

/**
 * discussion.md 34.3절: 기록을 지워야 하는 순간이 세 가지 더 있다 — 이걸 빠뜨리면 다음
 * 클릭에서 달력이 안 열리는 반대 방향의 결함이 생긴다.
 * - change: 날짜를 골라 달력이 스스로 닫힌다.
 * - blur: 다른 곳을 눌러(포커스가 옮겨가) 닫혔다.
 * - Escape: 키보드로 닫았다(포커스는 입력칸에 남아 blur가 안 일어난다).
 * 입력칸 요소 자체를 열쇠로 한 번만 붙인다(반복 호출로 리스너가 쌓이지 않게).
 */
function ensureCloseListeners(el: HTMLInputElement): void {
  if (listenersAttached.has(el)) return;
  listenersAttached.add(el);

  el.addEventListener("change", () => clearOpenState(el));
  el.addEventListener("blur", () => clearOpenState(el));
  el.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearOpenState(el);
  });
}

export function openDatePicker(el: HTMLInputElement | null): void {
  if (!el) return;
  ensureCloseListeners(el);

  if (openPickers.has(el)) {
    // 이번 클릭은 "닫으려는" 두 번째 클릭이다 — 브라우저가 이미 바깥 클릭으로 닫았으므로
    // showPicker()를 다시 부르지 않고 기록만 지운다.
    clearOpenState(el);
    return;
  }

  if (typeof el.showPicker === "function") {
    try {
      el.showPicker();
      openPickers.add(el);
      return;
    } catch {
      // 사용자 제스처 밖에서 호출되는 등 showPicker가 막히는 브라우저는 포커스로 대체한다.
    }
  }
  el.focus({ preventScroll: true });
}
