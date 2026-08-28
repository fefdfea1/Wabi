"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRIES, DOCS, GUIDE_BY_COUNTRY, PAIN_BY_COUNTRY, TASKS_BY_COUNTRY } from "@/Front/common/data/tasks";
import { readStoredDepartureDate, writeStoredDepartureDate } from "@/Front/common/storage/departureDate";
import type {
  CountryCode,
  DocItem,
  DueOption,
  GuideSituation,
  Task,
  TabId,
  TaskPhase,
} from "@/Front/common/types/domain";
import { computeDDay, computeVisaExpiry, firstSentence, formatKoreanDate, pickNextTask } from "./wabiLogic";

export type SheetKind = "guide" | "pain" | "addTask" | "addFile" | null;
export type UploadKind = "camera" | "album" | "file";

export const DUE_OPTIONS: DueOption[] = ["오늘까지", "이번 주", "이번 달", "도착 후"];

const UPLOAD_PRESETS: Record<UploadKind, { ext: string; name: string }> = {
  camera: { ext: "JPG", name: "촬영한 사진" },
  album: { ext: "JPG", name: "앨범에서 가져온 사진" },
  file: { ext: "PDF", name: "가져온 파일" },
};

/** COUNTRIES에 실제로 등록된 국가 코드마다 빈 값을 채운 Record를 만든다(하드코딩 대신 데이터 기반). */
function emptyByCountry<T>(): Record<CountryCode, T[]> {
  const result = {} as Record<CountryCode, T[]>;
  COUNTRIES.forEach((c) => {
    result[c.code] = [];
  });
  return result;
}

/** 국가별 할 일 중 데이터에 done:true로 미리 표시된 것만 완료 상태로 시드한다(국가별로 분리 보관). */
function seedDone(): Record<CountryCode, Record<string, boolean>> {
  const result = {} as Record<CountryCode, Record<string, boolean>>;
  COUNTRIES.forEach((c) => {
    const map: Record<string, boolean> = {};
    (TASKS_BY_COUNTRY[c.code] ?? []).forEach((task) => {
      if (task.done) map[task.id] = true;
    });
    result[c.code] = map;
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
  const [countryCode, setCountryCode] = useState<CountryCode | null>(COUNTRIES[0]?.code ?? null);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [done, setDone] = useState<Record<CountryCode, Record<string, boolean>>>(seedDone);
  const [customTasks, setCustomTasks] = useState<Record<CountryCode, Task[]>>(emptyByCountry<Task>);
  const [docs, setDocs] = useState<DocItem[]>(DOCS);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [guideSituation, setGuideSituation] = useState<GuideSituation>("pre");
  const [guideQuestionId, setGuideQuestionId] = useState<string | null>(null);
  const [painItemId, setPainItemId] = useState<string | null>(null);

  const [addTaskTitle, setAddTaskTitle] = useState("");
  const [addTaskPhase, setAddTaskPhase] = useState<TaskPhase>("pre");
  const [addTaskDue, setAddTaskDue] = useState<DueOption>("이번 주");

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? null;

  const countryTasks = countryCode ? (TASKS_BY_COUNTRY[countryCode] ?? []) : [];
  const countryCustomTasks = countryCode ? (customTasks[countryCode] ?? []) : [];
  const countryDone = countryCode ? (done[countryCode] ?? {}) : {};
  const countryGuideAll = countryCode ? (GUIDE_BY_COUNTRY[countryCode] ?? { pre: [], post: [] }) : { pre: [], post: [] };
  const countryPain = countryCode ? (PAIN_BY_COUNTRY[countryCode] ?? []) : [];

  const allTasks = useMemo(() => countryTasks.concat(countryCustomTasks), [countryTasks, countryCustomTasks]);
  const total = allTasks.length;
  const doneCount = allTasks.filter((task) => countryDone[task.id]).length;
  const phaseTasks = allTasks.filter((task) => task.phase === phase);
  const phaseDoneCount = phaseTasks.filter((task) => countryDone[task.id]).length;
  const weekTasks = allTasks.filter((task) => task.week);
  const nextTask = pickNextTask(allTasks, countryDone);
  const nextDescription = nextTask ? firstSentence(nextTask.body) : "";

  // discussion.md 10.3절: 오늘 날짜는 반드시 client effect 안에서만 계산한다. 이 라우트는
  // 정적 프리렌더 대상이라 렌더 중에 new Date()를 쓰면 빌드 시점 날짜로 고정되고
  // 하이드레이션 불일치도 생긴다. 초기값 null은 서버·최초 클라이언트 렌더가 항상 같아 안전하다.
  const [departureDate, setDepartureDateState] = useState<string | null>(null);
  const [dday, setDday] = useState<number | null>(null);

  useEffect(() => {
    const stored = readStoredDepartureDate();
    if (stored) setDepartureDateState(stored);
  }, []);

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

  const detailTask = detailTaskId ? (allTasks.find((task) => task.id === detailTaskId) ?? null) : null;
  const detailDone = detailTask ? !!countryDone[detailTask.id] : false;

  const guideQuestions = countryGuideAll[guideSituation];
  const guideAnswer = guideQuestionId
    ? (countryGuideAll.pre.concat(countryGuideAll.post).find((q) => q.id === guideQuestionId) ?? null)
    : null;

  const painAnswer = painItemId ? (countryPain.find((p) => p.id === painItemId) ?? null) : null;

  function toggleTask(id: string) {
    if (!countryCode) return;
    const code = countryCode;
    setDone((prev) => {
      const current = prev[code] ?? {};
      return { ...prev, [code]: { ...current, [id]: !current[id] } };
    });
  }

  function goTab(next: TabId) {
    setTab(next);
    setDetailTaskId(null);
  }

  function openDetail(id: string) {
    setDetailTaskId(id);
  }

  function closeDetail() {
    setDetailTaskId(null);
  }

  /** 캔버스 completeDetail: 미완료면 완료 처리하고 상세를 닫는다(DETAIL-04). */
  function completeDetail() {
    if (detailTask && !detailDone) toggleTask(detailTask.id);
    setDetailTaskId(null);
  }

  /** 캔버스 undoDetail: 완료 취소만 하고 상세는 열린 채로 둔다(DETAIL-06, DETAIL-04와 다른 동작). */
  function undoDetail() {
    if (detailTask && detailDone) toggleTask(detailTask.id);
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
    setAddTaskTitle("");
    setAddTaskPhase(phase);
    setAddTaskDue("이번 주");
    setSheet("addTask");
  }
  function closeAddTask() {
    setSheet(null);
  }

  function submitAddTask() {
    const title = addTaskTitle.trim();
    if (!title || !countryCode) return;
    const code = countryCode;

    const newTask: Task = {
      id: `custom-${Date.now()}`,
      phase: addTaskPhase,
      title,
      meta: addTaskDue,
      week: addTaskDue === "오늘까지" || addTaskDue === "이번 주",
      urgent: addTaskDue === "오늘까지",
      tag: `${addTaskPhase === "pre" ? "출국 전" : "현지 정착"} · 직접 추가`,
      body: "직접 등록한 할 일입니다.",
      items: [],
      done: false,
    };

    setCustomTasks((prev) => ({ ...prev, [code]: (prev[code] ?? []).concat(newTask) }));
    setPhase(addTaskPhase);
    setSheet(null);
    setAddTaskTitle("");
  }

  function openAddFile() {
    setSheet("addFile");
  }
  function closeAddFile() {
    setSheet(null);
  }

  function pickUploadOption(kind: UploadKind) {
    const preset = UPLOAD_PRESETS[kind];
    setDocs((prev) => prev.concat({ id: `doc-${Date.now()}`, ext: preset.ext, name: preset.name, meta: "방금 추가" }));
    setSheet(null);
  }

  function toggleCountryPicker() {
    setCountryPickerOpen((prev) => !prev);
  }

  /** 국가를 바꾸면 이전 국가의 할 일 상세는 더 이상 유효하지 않으므로 닫는다. */
  function selectCountry(code: CountryCode) {
    setCountryCode(code);
    setCountryPickerOpen(false);
    setDetailTaskId(null);
  }

  return {
    tab,
    goTab,
    phase,
    setPhase,

    country,
    countryPickerOpen,
    toggleCountryPicker,
    selectCountry,
    dday,
    departureDate,
    departureLabel,
    visaExpiryLabel,
    showVisaLine,
    setDepartureDate,

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

    detailTask,
    detailDone,
    openDetail,
    closeDetail,
    completeDetail,
    undoDetail,

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
    addTaskDue,
    setAddTaskDue,
    submitAddTask,

    docs,
    openAddFile,
    closeAddFile,
    pickUploadOption,
  };
}
