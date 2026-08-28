"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRIES, GUIDE_BY_COUNTRY, PAIN_BY_COUNTRY, TASKS_BY_COUNTRY } from "@/Front/common/data/tasks";
import { formatDateOnly, formatKoreanDate } from "@/Front/common/date/localDate";
import { generateId } from "@/Front/common/id/generateId";
import { clearStoredAvatar, processAvatarFile, readStoredAvatar, writeStoredAvatar } from "@/Front/common/storage/avatar";
import { readStoredCountry, writeStoredCountry } from "@/Front/common/storage/country";
import { readStoredCustomTasks, writeStoredCustomTasks } from "@/Front/common/storage/customTasks";
import { readStoredDepartureDate, writeStoredDepartureDate } from "@/Front/common/storage/departureDate";
import { readStoredDone, writeStoredDone } from "@/Front/common/storage/done";
import { readStoredNotes, writeStoredNotes } from "@/Front/common/storage/notes";
import type {
  CountryCode,
  GuideSituation,
  NoteRecord,
  Task,
  TabId,
  TaskPhase,
} from "@/Front/common/types/domain";
import { computeDDay, computeVisaExpiry, deriveDueDisplay, firstSentence, pickNextTask, sortTasksForDisplay } from "./wabiLogic";

export type SheetKind = "guide" | "pain" | "addTask" | "noteEditor" | "countryPicker" | null;

/** COUNTRIES에 실제로 등록된 국가 코드마다 빈 값을 채운 Record를 만든다(하드코딩 대신 데이터 기반). */
function emptyByCountry<T>(): Record<CountryCode, T[]> {
  const result = {} as Record<CountryCode, T[]>;
  COUNTRIES.forEach((c) => {
    result[c.code] = [];
  });
  return result;
}

/**
 * discussion.md 23.1절: 조사한 할 일이 더 이상 목록의 초기값이 아니라 추천 원본일 뿐이라, 완료
 * 상태도 더 이상 조사 데이터에서 미리 시드하지 않는다 — 이용자가 추천에서 고르거나 직접 적어야
 * 비로소 그 할 일이 생기고, done은 그 뒤에 이용자가 직접 토글해야만 켜진다.
 */
function emptyDoneByCountry(): Record<CountryCode, Record<string, boolean>> {
  const result = {} as Record<CountryCode, Record<string, boolean>>;
  COUNTRIES.forEach((c) => {
    result[c.code] = {};
  });
  return result;
}

/**
 * 앱 전체 상태를 한 곳에 모은다(TechSpec.md 5절: WabiApp이 탭·오버레이·진행률 계산을 담당).
 * 캔버스 05섹션 Component 클래스의 단일 state 모델을 React 훅으로 옮긴 것으로,
 * 하위 화면/시트 컴포넌트는 모두 이 훅에서 내려주는 값과 콜백만 받는 표시 전담 컴포넌트다.
 *
 * 사용자 승인으로 할 일·가이드·어려움이 국가별로 나뉘어(TASKS_BY_COUNTRY 등) 데이터가 들어왔다.
 * 완료 상태와 직접 추가한 할 일도 국가별로 분리해 보관한다 — 국가를 바꾸면 이전 국가의
 * 완료 상태·직접 추가 항목이 다른 국가 화면에 섞여 보이지 않는다.
 */
export function useWabiApp() {
  const [tab, setTab] = useState<TabId>("home");
  const [phase, setPhase] = useState<TaskPhase>("pre");
  // discussion.md 35.4절: 초기값을 COUNTRIES[0](호주)로 두면 SSR·첫 페인트에 항상 호주 내용이
  // 그려지고, 마운트 후 실제 저장된 국가로 바뀌며 깜빡인다 — 국가는 테마와 달리 속성 하나가
  // 아니라 렌더 결과 전체를 좌우해 인라인 스크립트로 미리 풀 수 없다. 초기값을 null로 둬
  // 저장된 국가를 읽기 전에는 국가에 딸린 내용(할 일·다음 할 일·국가 배지 등)이 아예 그려지지
  // 않게 한다 — countryCode가 null이면 countryTasks/countryCustomTasks/countryDone 등 아래
  // 파생값들이 이미 전부 빈 값으로 갈라지므로(각각의 `countryCode ? ... : ...`) 화면 대부분이
  // 자연히 빈 상태로 그려진다.
  const [countryCode, setCountryCode] = useState<CountryCode | null>(null);

  useEffect(() => {
    const stored = readStoredCountry();
    setCountryCode(stored ?? COUNTRIES[0]?.code ?? null);
  }, []);

  // discussion.md 35.1절/35.2절(PM 실측): 완료 표시는 이 앱의 중심(준비 진행률)인데 저장 계층이
  // 아예 없었다 — toggleTask가 메모리 상태만 바꾸고 새로고침하면 전부 해제됐다. notes와 같은
  // 패턴(초기값은 빈 Record, 마운트 후 읽어온다)을 따른다.
  const [done, setDone] = useState<Record<CountryCode, Record<string, boolean>>>(emptyDoneByCountry);

  useEffect(() => {
    setDone((prev) => ({ ...prev, ...readStoredDone() }));
  }, []);

  // discussion.md 21.1절: 직접 추가한 할 일(localStorage, notes와 같은 자리). 초기값은 항상
  // 빈 Record(서버·최초 클라이언트 렌더가 같아 안전)이고, 실제 값은 마운트 후 읽어온다.
  const [customTasks, setCustomTasks] = useState<Record<CountryCode, Task[]>>(emptyByCountry<Task>);

  useEffect(() => {
    setCustomTasks((prev) => ({ ...prev, ...readStoredCustomTasks() }));
  }, []);

  // 메모(localStorage) — discussion.md 16절. 초기값은 항상 빈 배열(서버·최초 클라이언트 렌더가
  // 같아 안전)이고, 실제 목록은 마운트 후 localStorage에서 읽어온다.
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");

  useEffect(() => {
    setNotes(readStoredNotes());
  }, []);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0)),
    [notes],
  );

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [guideSituation, setGuideSituation] = useState<GuideSituation>("pre");
  const [guideQuestionId, setGuideQuestionId] = useState<string | null>(null);
  const [painItemId, setPainItemId] = useState<string | null>(null);

  // discussion.md 25.1절/25.3절: 제목·phase는 추천을 고르면 원본 값으로 채워지고, 이용자가
  // 직접 고치면(키 입력) 그 선택이 풀려야 한다 — 그래서 raw setter(...State)와, 그 위에서
  // 선택 해제까지 함께 하는 wrapper(바깥에 노출하는 setAddTaskTitle/setAddTaskPhase)로 나눈다.
  // 추천을 고르는 selectRecommendedTask는 raw setter를 써서 선택을 지우지 않는다.
  const [addTaskTitle, setAddTaskTitleState] = useState("");
  const [addTaskPhase, setAddTaskPhaseState] = useState<TaskPhase>("pre");
  // discussion.md 25.4절: 추천을 고른 상태(제목·phase를 직접 고치지 않은 상태)로 등록하면
  // 원본 body·items·sourceUrl·tag·id가 함께 들어간다. 제목을 고치거나 phase를 바꾸면 null로
  // 풀리고 평범한 직접 추가 할 일이 된다.
  const [addTaskSelectedRecommendationId, setAddTaskSelectedRecommendationId] = useState<string | null>(null);

  function setAddTaskTitle(value: string) {
    setAddTaskTitleState(value);
    setAddTaskSelectedRecommendationId(null);
  }

  function setAddTaskPhase(value: TaskPhase) {
    setAddTaskPhaseState(value);
    setAddTaskSelectedRecommendationId(null);
  }

  // discussion.md 25.5절: 마감 고정 선택지(오늘까지/이번 주/이번 달/도착 후)를 없애고 날짜
  // 직접 선택만 남긴다 — DueOption·addTaskDue 관련 상태도 함께 지웠다. 마감은 선택 사항이라
  // 비워 둔 채 등록할 수 있다.
  const [addTaskDueDate, setAddTaskDueDate] = useState("");

  // discussion.md 19.3절: dueDate가 있는 할 일의 meta/urgent/week를 오늘 날짜 기준으로 다시
  // 계산하기 위한 값. computeDDay와 같은 이유로 client effect 안에서만 만든다.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
  }, []);

  // discussion.md 20.13절 8번: 할 일 마감 입력의 min(오늘)에 쓴다. P-06과 같은 함정이라
  // 렌더 중에 계산하지 않고 today와 함께 client effect에서만 만든다 — 정적 프리렌더 시점에
  // 굳으면 하루만 지나도 어제 날짜가 min이 되어 버린다.
  const todayIso = useMemo(() => (today ? formatDateOnly(today) : null), [today]);

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? null;

  // discussion.md 23.1절/23.5절: TASKS_BY_COUNTRY(조사 데이터)는 지우지 않지만 더 이상 목록의
  // 초기값이 아니다 — 아래 recommendedTasks(할 일 추가 시트의 추천)의 원본으로만 쓰인다.
  const countryTasks = countryCode ? (TASKS_BY_COUNTRY[countryCode] ?? []) : [];
  const countryCustomTasks = countryCode ? (customTasks[countryCode] ?? []) : [];
  const countryDone = countryCode ? (done[countryCode] ?? {}) : {};
  const countryGuideAll = countryCode ? (GUIDE_BY_COUNTRY[countryCode] ?? { pre: [], post: [] }) : { pre: [], post: [] };
  const countryPain = countryCode ? (PAIN_BY_COUNTRY[countryCode] ?? []) : [];

  // discussion.md 23.1절: 할 일 목록은 이제 이용자가 추천에서 고르거나 직접 적은 것(customTasks)
  // 뿐이다 — 조사 데이터(countryTasks)는 더 이상 여기 섞이지 않는다. discussion.md 19.3절:
  // dueDate가 있는 할 일(달력으로 직접 고른 마감)은 저장된 meta/urgent/week를 그대로 쓰지 않고
  // today 기준으로 매번 다시 계산한다 — 그렇지 않으면 "3일 남음" 같은 문구가 날짜가 지나도
  // 그대로 굳어버린다(P-06과 같은 함정). dueDate가 없는 할 일은 그대로 둔다.
  const allTasks = useMemo(() => {
    if (!today) return countryCustomTasks;
    return countryCustomTasks.map((task) => {
      if (!task.dueDate) return task;
      const derived = deriveDueDisplay(task.dueDate, today);
      return derived ? { ...task, ...derived } : task;
    });
  }, [countryCustomTasks, today]);
  const total = allTasks.length;
  const doneCount = allTasks.filter((task) => countryDone[task.id]).length;
  const phaseTasksUnsorted = allTasks.filter((task) => task.phase === phase);
  const phaseDoneCount = phaseTasksUnsorted.filter((task) => countryDone[task.id]).length;
  // discussion.md 21.3절: 이제 목록 전체가 이용자가 넣은 것이라 기본 제공/직접 추가 구분이
  // 필요 없어졌다 — createdAt 내림차순으로만 정렬한다(sortTasksForDisplay에 빈 builtin 배열을
  // 넘겨 재사용한다).
  const phaseTasks = sortTasksForDisplay([], phaseTasksUnsorted);
  // discussion.md 39절: 홈의 "이번 주 할 일"도 할 일 탭과 같은 순서로 보여준다 — 거르기만 하면
  // 저장된 순서(만든 순)가 그대로 나와, 같은 할 일이 두 화면에서 다른 자리에 놓인다.
  const weekTasks = sortTasksForDisplay([], allTasks.filter((task) => task.week));
  const nextTask = pickNextTask(allTasks, countryDone);
  const nextDescription = nextTask ? firstSentence(nextTask.body) : "";

  // discussion.md 23.2절: 할 일 추가 시트의 추천. 시트에 이미 있는 phase 선택(addTaskPhase)에
  // 맞고, 현재 국가의 것이며, 이미 내 목록에 있는(같은 id) 항목은 감춘다 — id는 원본 그대로
  // 쓰므로(23.3절) 이 id 비교가 "이미 골랐는지" 판별 기준이 된다.
  const recommendedTasks = countryTasks.filter(
    (task) => task.phase === addTaskPhase && !countryCustomTasks.some((custom) => custom.id === task.id),
  );

  // discussion.md 10.3절: 오늘 날짜는 반드시 client effect 안에서만 계산한다. 이 라우트는
  // 정적 프리렌더 대상이라 렌더 중에 new Date()를 쓰면 빌드 시점 날짜로 고정되고
  // 하이드레이션 불일치도 생긴다. 초기값 null은 서버·최초 클라이언트 렌더가 항상 같아 안전하다.
  const [departureDate, setDepartureDateState] = useState<string | null>(null);
  const [dday, setDday] = useState<number | null>(null);

  useEffect(() => {
    const stored = readStoredDepartureDate();
    if (stored) setDepartureDateState(stored);
  }, []);

  // discussion.md 20.5절/20.6절: 프로필 사진(localStorage). 초기값 null은 서버·최초 클라이언트
  // 렌더가 같아 안전하고, 실제 값은 마운트 후 읽어온다(notes/departureDate와 같은 패턴).
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setAvatarUrl(readStoredAvatar());
  }, []);

  /** 처리(정사각 크롭 + 256×256 축소 + webp) 후 저장한다. 실패하면 알리고 이전 아바타를 유지한다. */
  async function updateAvatar(file: File) {
    let dataUrl: string;
    try {
      dataUrl = await processAvatarFile(file);
    } catch {
      window.alert("사진을 처리하지 못했습니다. 다른 사진으로 다시 시도해 주세요.");
      return;
    }
    if (!writeStoredAvatar(dataUrl)) {
      window.alert("프로필 사진을 저장하지 못했습니다. 다시 시도해 주세요.");
      return;
    }
    setAvatarUrl(dataUrl);
  }

  /**
   * discussion.md 30.2절: window.confirm(브라우저 기본 대화상자, 토큰·서체·화면 모드를 안 따름)
   * 대신 27.2절과 같은 방식(pending 상태 + 셸 레벨 ConfirmSheet)을 쓴다. 실제 삭제(clearAvatar
   * 자리)는 확정 시에만 한다.
   */
  const [pendingAvatarClear, setPendingAvatarClear] = useState(false);

  function requestClearAvatar() {
    setPendingAvatarClear(true);
  }

  function cancelClearAvatar() {
    setPendingAvatarClear(false);
  }

  function confirmClearAvatar() {
    clearStoredAvatar();
    setAvatarUrl(null);
    setPendingAvatarClear(false);
  }

  useEffect(() => {
    if (!departureDate) {
      setDday(null);
      return;
    }
    setDday(computeDDay(departureDate, new Date()));
  }, [departureDate]);

  function setDepartureDate(next: string) {
    setDepartureDateState(next);
    writeStoredDepartureDate(next);
  }

  const departureLabel = departureDate ? formatKoreanDate(departureDate) : null;
  const visaExpiryLabel =
    departureDate && country?.stayDurationDays
      ? (() => {
          const iso = computeVisaExpiry(departureDate, country.stayDurationDays);
          return iso ? formatKoreanDate(iso) : null;
        })()
      : null;
  // discussion.md 10.2절: 출국일이 없으면 두 줄 모두 빈 상태 문구, 출국일은 있는데
  // 국가의 체류 허용 기간이 조사되지 않았으면 비자 만료일 줄 자체를 숨긴다.
  const showVisaLine = !departureDate || !!visaExpiryLabel;

  const guideQuestions = countryGuideAll[guideSituation];
  const guideAnswer = guideQuestionId
    ? (countryGuideAll.pre.concat(countryGuideAll.post).find((q) => q.id === guideQuestionId) ?? null)
    : null;

  const painAnswer = painItemId ? (countryPain.find((p) => p.id === painItemId) ?? null) : null;

  /**
   * discussion.md 35.2절(PM 실측): 준비 진행률이 이 앱의 중심인데 저장 계층이 아예 없어
   * 새로고침하면 전부 해제됐다. 국가별로 나눠 저장한다(호주에서 체크한 것이 캐나다로 넘어가면
   * 안 된다) — writeStoredDone이 실패하면 알리고 화면 상태(done)를 바꾸지 않는다(24.1절).
   */
  function toggleTask(id: string) {
    if (!countryCode) return;
    const code = countryCode;
    const current = done[code] ?? {};
    const next = { ...done, [code]: { ...current, [id]: !current[id] } };

    if (!writeStoredDone(next)) {
      window.alert("완료 표시를 저장하지 못했습니다. 저장 공간이 가득 찼거나 브라우저가 저장을 막고 있을 수 있습니다.");
      return;
    }

    setDone(next);
  }

  function goTab(next: TabId) {
    setTab(next);
  }

  function openGuide() {
    setSheet("guide");
    setGuideQuestionId(null);
  }
  function closeGuide() {
    setSheet(null);
    setGuideQuestionId(null);
  }
  function backToGuideList() {
    setGuideQuestionId(null);
  }

  function openPain() {
    setSheet("pain");
    setPainItemId(null);
  }
  function closePain() {
    setSheet(null);
    setPainItemId(null);
  }
  function backToPainList() {
    setPainItemId(null);
  }

  function openAddTask() {
    setAddTaskTitleState("");
    setAddTaskPhaseState(phase);
    setAddTaskSelectedRecommendationId(null);
    setAddTaskDueDate("");
    setSheet("addTask");
  }
  function closeAddTask() {
    setSheet(null);
  }

  /**
   * discussion.md 25.3절: 추천을 누르면 제목칸을 채우고 그 항목의 phase에 맞춰 phase도 함께
   * 바꾼다 — 목록에는 아직 추가되지 않는다(등록은 submitAddTask 하나뿐, 25.1절). raw
   * setter(...State)를 써서 이 자체가 "직접 고침"으로 취급돼 선택이 풀리지 않게 한다. 다른
   * 추천을 누르면 이 함수가 다시 호출돼 그대로 교체된다.
   */
  function selectRecommendedTask(source: Task) {
    setAddTaskTitleState(source.title);
    setAddTaskPhaseState(source.phase);
    setAddTaskSelectedRecommendationId(source.id);
  }

  /**
   * discussion.md 25.4절: 추천을 고른 상태(제목·phase를 직접 고치지 않은 상태)로 등록하면
   * 원본 body·items·sourceUrl·tag·id가 그대로 들어간다 — 제목만 남기고 버리면 출처 없는
   * 주장만 남는다. 제목을 고치거나 phase를 바꾸면 addTaskSelectedRecommendationId가 이미
   * null로 풀려 있으므로(setAddTaskTitle/setAddTaskPhase) 평범한 직접 추가 할 일이 된다.
   */
  function submitAddTask() {
    const title = addTaskTitle.trim();
    if (!title || !countryCode) return;
    const code = countryCode;

    // discussion.md 25.5절: 마감은 이제 날짜 직접 선택뿐이고 선택 사항이다 — 비어 있으면
    // meta/week/urgent 셋 다 넣지 않는다(22절, 고정 선택지 폴백이 없어졌다).
    const dueDisplay = addTaskDueDate ? deriveDueDisplay(addTaskDueDate, new Date()) : null;

    const selectedSource = addTaskSelectedRecommendationId
      ? countryTasks.find((task) => task.id === addTaskSelectedRecommendationId)
      : null;

    const newTask: Task = selectedSource
      ? {
          id: selectedSource.id,
          phase: selectedSource.phase,
          title,
          tag: selectedSource.tag,
          body: selectedSource.body,
          items: selectedSource.items,
          done: false,
          sourceUrl: selectedSource.sourceUrl,
          meta: dueDisplay ? dueDisplay.meta : undefined,
          week: dueDisplay ? dueDisplay.week : undefined,
          urgent: dueDisplay ? dueDisplay.urgent : undefined,
          dueDate: dueDisplay ? addTaskDueDate : undefined,
          createdAt: new Date().toISOString(),
        }
      : {
          // discussion.md 24.2절: Date.now() 기반 id는 같은 밀리초에 두 개가 만들어지면 겹쳐서
          // 하나를 지울 때 filter가 둘 다 지운다 — crypto.randomUUID()로 바꾼다(보안 컨텍스트가
          // 아니면 시각+난수로 물러선다, generateId 참고). 추천을 고른 채 등록한 항목은 위
          // 분기에서 원본 id를 그대로 쓰므로 이 문제와 무관하다.
          id: generateId("custom"),
          phase: addTaskPhase,
          title,
          tag: `${addTaskPhase === "pre" ? "출국 전" : "현지 정착"} · 직접 추가`,
          // discussion.md 37.1절: 이용자가 적지 않은 것을 앱이 대신 지어내지 않는다(22절과 같은
          // 원칙) — "직접 등록한 할 일입니다."는 아무 정보도 안 주면서 자리만 차지했다. 빈
          // body는 NextActionCard가 그 설명 자리를 아예 그리지 않는 신호가 된다.
          body: "",
          items: [],
          done: false,
          meta: dueDisplay ? dueDisplay.meta : undefined,
          week: dueDisplay ? dueDisplay.week : undefined,
          urgent: dueDisplay ? dueDisplay.urgent : undefined,
          dueDate: dueDisplay ? addTaskDueDate : undefined,
          // discussion.md 21.2절/21.3절: 정렬 전용(화면에는 표시하지 않는다) — 목록 화면에서 직접
          // 추가한 할 일을 최근 만든 순으로 위에 올리는 데 쓴다.
          createdAt: new Date().toISOString(),
        };

    // discussion.md 24.1절: 저장 실패를 조용히 삼키지 않는다 — 알리고, 입력을 지우지 않으며
    // (시트를 닫지 않고 return), 화면 상태(customTasks)도 저장에 성공했을 때만 바꾼다.
    const next = { ...customTasks, [code]: (customTasks[code] ?? []).concat(newTask) };
    if (!writeStoredCustomTasks(next)) {
      window.alert("할 일을 저장하지 못했습니다. 저장 공간이 가득 찼거나 브라우저가 저장을 막고 있을 수 있습니다.");
      return;
    }

    setCustomTasks(next);
    setPhase(newTask.phase);
    setSheet(null);
    setAddTaskTitleState("");
    setAddTaskSelectedRecommendationId(null);
    setAddTaskDueDate("");
  }

  /**
   * discussion.md 21.4절/38.1절: 목록의 모든 할 일이 이용자가 직접 넣었거나 추천에서 고른
   * 것이라(27절 이후 상세 화면 없이 목록 행에서만 삭제한다) 예외가 없다. 저장에 실패하면
   * 알리고 false를 돌려줘 호출부가 UI를 닫지 않게 한다(24.1절) — 실제로는 남아 있는데 사라진
   * 것처럼 보이면 안 된다.
   */
  function performDeleteTask(id: string): boolean {
    if (!countryCode) return false;
    const code = countryCode;
    const next = { ...customTasks, [code]: (customTasks[code] ?? []).filter((task) => task.id !== id) };

    if (!writeStoredCustomTasks(next)) {
      window.alert("할 일을 삭제하지 못했습니다. 다시 시도해 주세요.");
      return false;
    }

    setCustomTasks(next);
    return true;
  }

  /**
   * discussion.md 27.2절/38절: 목록 행(ListRow)의 삭제 버튼이 누른 항목의 id를 담아 확인 시트를
   * 연다(상세 화면은 38절에서 없앴다 — 목록 행이 유일한 삭제 경로다). 시트는 WabiApp 셸
   * 레벨에서 pendingDeleteTaskId를 보고 렌더한다(TasksScreen·HomeScreen 둘 다 같은 ListRow를
   * 쓰므로 공용으로 둔다).
   */
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);

  function requestDeleteTask(id: string) {
    setPendingDeleteTaskId(id);
  }

  function cancelDeleteTask() {
    setPendingDeleteTaskId(null);
  }

  /** 목록 행에서 시작된 삭제를 확정한다 — 성공하면 확인 시트를 닫는다. */
  function confirmDeleteTask() {
    if (!pendingDeleteTaskId) return;
    if (performDeleteTask(pendingDeleteTaskId)) setPendingDeleteTaskId(null);
  }

  const pendingDeleteTask = pendingDeleteTaskId ? (allTasks.find((task) => task.id === pendingDeleteTaskId) ?? null) : null;

  /** discussion.md 16.3절: 새 메모 추가 — 편집 대상 없이 빈 본문으로 시트를 연다. */
  function openAddNote() {
    setEditingNoteId(null);
    setNoteBody("");
    setSheet("noteEditor");
  }

  /** 기존 메모를 눌러 편집 — 본문을 채워 시트를 연다. */
  function openEditNote(id: string) {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    setEditingNoteId(id);
    setNoteBody(target.body);
    setSheet("noteEditor");
  }

  function closeNoteEditor() {
    setSheet(null);
    setEditingNoteId(null);
    setNoteBody("");
  }

  /**
   * 저장 시점의 전체 타임스탬프를 남긴다 — 같은 날 여러 메모를 고쳐도 정렬 순서가 정확하다.
   * discussion.md 24.1절: 저장 실패를 조용히 삼키지 않는다 — 알리고, 입력을 지우지 않으며
   * (closeNoteEditor를 부르지 않고 return), 저장에 성공했을 때만 화면 상태(notes)를 바꾼다.
   */
  function saveNote() {
    const body = noteBody.trim();
    if (!body) return;
    const updatedAt = new Date().toISOString();

    const next: NoteRecord[] = editingNoteId
      ? notes.map((n) => (n.id === editingNoteId ? { ...n, body, updatedAt } : n))
      : notes.concat({ id: generateId("note"), body, updatedAt });

    if (!writeStoredNotes(next)) {
      window.alert("메모를 저장하지 못했습니다. 저장 공간이 가득 찼거나 브라우저가 저장을 막고 있을 수 있습니다.");
      return;
    }

    setNotes(next);
    closeNoteEditor();
  }

  /**
   * discussion.md 19.7절: 홈·메모가 공유하는 우측 336 패널의 "바로 적는" textarea. 별도 모달을
   * 띄우지 않고, 저장하기를 누르면 곧바로 메모 한 편을 만들고 입력창을 비운다.
   * discussion.md 24.1절: 성공 여부를 돌려준다 — 호출부(NotesPanel)가 저장에 성공했을 때만
   * 입력창을 비워야 실패 시 이용자가 방금 쓴 글을 잃지 않는다.
   */
  function quickAddNote(body: string): boolean {
    const trimmed = body.trim();
    if (!trimmed) return false;
    const updatedAt = new Date().toISOString();
    const next = notes.concat({ id: generateId("note"), body: trimmed, updatedAt });

    if (!writeStoredNotes(next)) {
      window.alert("메모를 저장하지 못했습니다. 저장 공간이 가득 찼거나 브라우저가 저장을 막고 있을 수 있습니다.");
      return false;
    }

    setNotes(next);
    return true;
  }

  /**
   * discussion.md 30.2절: window.confirm 대신 27.2절과 같은 방식(pending 상태 + 셸 레벨
   * ConfirmSheet)을 쓴다. 홈 우측 패널(NotesPanel)과 메모 탭(NotesScreen) 두 곳에서 모두
   * 이 하나의 pending 상태·시트를 공유한다.
   */
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);

  function requestDeleteNote(id: string) {
    setPendingDeleteNoteId(id);
  }

  function cancelDeleteNote() {
    setPendingDeleteNoteId(null);
  }

  /**
   * discussion.md 24.1절: 삭제 저장이 실패하면 화면 목록을 바꾸지 않고 시트도 닫지 않는다 —
   * 실제로는 남아 있는데 지워진 것처럼 보이면 안 된다.
   */
  function confirmDeleteNote() {
    if (!pendingDeleteNoteId) return;
    const id = pendingDeleteNoteId;
    const next = notes.filter((n) => n.id !== id);

    if (!writeStoredNotes(next)) {
      window.alert("메모를 삭제하지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    setNotes(next);
    if (editingNoteId === id) closeNoteEditor();
    setPendingDeleteNoteId(null);
  }

  /**
   * discussion.md 18.1절 / 캔버스 06절: 홈 배지·사이드바 국가 선택·'나' 화면 국가 변경 행,
   * 세 진입점이 모두 이 하나의 시트를 연다(CountryPickerSheet).
   */
  function openCountryPickerSheet() {
    setSheet("countryPicker");
  }
  function closeCountryPickerSheet() {
    setSheet(null);
  }

  /**
   * discussion.md 35.2절/35.3절(PM 실측): 저장 계층이 없어 새로고침하면 항상 호주로 돌아갔다 —
   * 메모·출국일과 같은 방식으로 저장한다. 저장에 실패하면 알리고 화면 상태(선택된 국가·시트)를
   * 바꾸지 않는다(24.1절) — 저장 안 된 선택이 된 것처럼 보이면 안 된다.
   */
  function selectCountry(code: CountryCode) {
    if (!writeStoredCountry(code)) {
      window.alert("국가를 저장하지 못했습니다. 저장 공간이 가득 찼거나 브라우저가 저장을 막고 있을 수 있습니다.");
      return;
    }

    setCountryCode(code);
    setSheet(null);
  }

  return {
    tab,
    goTab,
    phase,
    setPhase,

    country,
    openCountryPickerSheet,
    closeCountryPickerSheet,
    selectCountry,
    dday,
    departureDate,
    departureLabel,
    visaExpiryLabel,
    showVisaLine,
    setDepartureDate,
    avatarUrl,
    updateAvatar,
    pendingAvatarClear,
    requestClearAvatar,
    cancelClearAvatar,
    confirmClearAvatar,

    allTasks,
    total,
    doneCount,
    phaseTasks,
    phaseDoneCount,
    weekTasks,
    nextTask,
    nextDescription,
    done: countryDone,
    toggleTask,

    pendingDeleteTask,
    requestDeleteTask,
    cancelDeleteTask,
    confirmDeleteTask,

    sheet,
    openGuide,
    closeGuide,
    guideSituation,
    setGuideSituation,
    guideQuestions,
    guideQuestionId,
    setGuideQuestionId,
    guideAnswer,
    backToGuideList,

    openPain,
    closePain,
    painItems: countryPain,
    painItemId,
    setPainItemId,
    painAnswer,
    backToPainList,

    openAddTask,
    closeAddTask,
    addTaskTitle,
    setAddTaskTitle,
    addTaskPhase,
    setAddTaskPhase,
    addTaskDueDate,
    setAddTaskDueDate,
    todayIso,
    recommendedTasks,
    addTaskSelectedRecommendationId,
    selectRecommendedTask,
    submitAddTask,

    notes: sortedNotes,
    editingNoteId,
    noteBody,
    setNoteBody,
    openAddNote,
    openEditNote,
    closeNoteEditor,
    saveNote,
    quickAddNote,
    pendingDeleteNoteId,
    requestDeleteNote,
    cancelDeleteNote,
    confirmDeleteNote,
  };
}
