"use client";

import { COUNTRIES } from "@/Front/common/data/tasks";
import { AppHeader } from "@/Front/common/component/AppHeader";
import { ConfirmSheet } from "@/Front/common/component/ConfirmSheet";
import { TabBar } from "@/Front/common/component/TabBar";
import { NotesPanel } from "@/Front/common/component/NotesPanel";
import { HomeScreen } from "@/Front/home/component/HomeScreen";
import { TasksScreen } from "@/Front/tasks/component/TasksScreen";
import { NotesScreen } from "@/Front/notes/component/NotesScreen";
import { MeScreen } from "@/Front/me/component/MeScreen";
import { GuideSheet } from "@/Front/overlay/component/GuideSheet";
import { PainSheet } from "@/Front/overlay/component/PainSheet";
import { AddTaskSheet } from "@/Front/overlay/component/AddTaskSheet";
import { NoteEditorSheet } from "@/Front/overlay/component/NoteEditorSheet";
import { CountryPickerSheet } from "@/Front/overlay/component/CountryPickerSheet";
import { TaskDetailScreen } from "@/Front/task-detail/component/TaskDetailScreen";
import { useWabiApp } from "@/Front/app-shell/state/useWabiApp";
import styles from "./WabiApp.module.css";

export function WabiApp() {
  const wabi = useWabiApp();

  return (
    <div className={styles.shell}>
      {/*
        discussion.md 20.1절/20.2절: 우측 336px 패널(NotesPanel)은 이제 화면 공용이 아니라
        WabiApp 셸 레벨에 딱 하나만 마운트한다 — 탭이 바뀔 때마다 통째로 마운트/언마운트하면
        폭이 뚝 끊겨 보이기 때문에, 항상 떠 있는 채로 collapsed prop만 바뀌어 부드럽게 열고
        닫힌다(홈에서는 펼침, 그 외 탭에서는 접힘 — 메모 화면은 본문에 이미 같은 기능이 있어
        패널 자체가 필요 없다). 할 일·나 화면은 여전히 이 패널을 전혀 쓰지 않는다(11.6절).
      */}
      <main className={styles.content}>
        {/* discussion.md 20.13절 7번: 모바일·태블릿 헤더를 모든 탭에서 같은 자리에 공용으로
            띄운다(데스크톱은 자기 CSS에서 숨고 사이드바가 대신한다). */}
        <AppHeader
          countryLabel={wabi.country?.label ?? null}
          onOpenGuide={wabi.openGuide}
          onOpenCountryPicker={wabi.openCountryPickerSheet}
          onGoHome={() => wabi.goTab("home")}
        />

        {wabi.tab === "home" ? (
          <HomeScreen
            countryLabel={wabi.country?.label ?? null}
            dday={wabi.dday}
            doneCount={wabi.doneCount}
            total={wabi.total}
            nextTask={wabi.nextTask}
            nextDescription={wabi.nextDescription}
            weekTasks={wabi.weekTasks}
            done={wabi.done}
            painCount={wabi.painItems.length}
            onToggleTask={wabi.toggleTask}
            onDeleteTask={wabi.requestDeleteTask}
            onOpenPain={wabi.openPain}
            onGoTasks={() => wabi.goTab("tasks")}
          />
        ) : null}

        {wabi.tab === "tasks" ? (
          <TasksScreen
            phase={wabi.phase}
            onPhaseChange={wabi.setPhase}
            phaseTasks={wabi.phaseTasks}
            phaseDoneCount={wabi.phaseDoneCount}
            done={wabi.done}
            onToggleTask={wabi.toggleTask}
            onDeleteTask={wabi.requestDeleteTask}
            onOpenAddTask={wabi.openAddTask}
          />
        ) : null}

        {wabi.tab === "notes" ? (
          <NotesScreen
            notes={wabi.notes}
            onOpenAdd={wabi.openAddNote}
            onOpenEdit={wabi.openEditNote}
            onDelete={wabi.requestDeleteNote}
          />
        ) : null}

        {wabi.tab === "me" ? (
          <MeScreen
            country={wabi.country}
            onOpenCountryPicker={wabi.openCountryPickerSheet}
            doneCount={wabi.doneCount}
            total={wabi.total}
            noteCount={wabi.notes.length}
            departureDate={wabi.departureDate}
            departureLabel={wabi.departureLabel}
            visaExpiryLabel={wabi.visaExpiryLabel}
            showVisaLine={wabi.showVisaLine}
            onDepartureDateChange={wabi.setDepartureDate}
            avatarUrl={wabi.avatarUrl}
            onAvatarChange={wabi.updateAvatar}
            onAvatarClear={wabi.requestClearAvatar}
          />
        ) : null}
      </main>

      <NotesPanel
        collapsed={wabi.tab !== "home"}
        notes={wabi.notes}
        onQuickAdd={wabi.quickAddNote}
        onOpenEdit={wabi.openEditNote}
        onDelete={wabi.requestDeleteNote}
        footer={
          <button type="button" className={styles.panelPainCard} onClick={wabi.openPain}>
            <span className={styles.panelPainTitle}>먼저 간 사람들이 힘들어한 것</span>
            <span className={styles.panelPainMeta}>
              {/* discussion.md 28절: 개수를 세어 보여주지 않고 항상 같은 문구를 쓴다. */}
              {wabi.painItems.length > 0 ? "자주 나온 어려움 ›" : "정리하는 대로 보여드립니다 ›"}
            </span>
          </button>
        }
      />

      <TabBar
        active={wabi.tab}
        onSelect={wabi.goTab}
        incompleteTaskCount={wabi.total - wabi.doneCount}
        onOpenGuide={wabi.openGuide}
        countryLabel={wabi.country?.label ?? null}
        onOpenCountryPicker={wabi.openCountryPickerSheet}
      />

      {wabi.sheet === "guide" ? (
        <GuideSheet
          situation={wabi.guideSituation}
          onSituationChange={wabi.setGuideSituation}
          questions={wabi.guideQuestions}
          questionId={wabi.guideQuestionId}
          onOpenQuestion={wabi.setGuideQuestionId}
          answer={wabi.guideAnswer}
          onBack={wabi.backToGuideList}
          onClose={wabi.closeGuide}
        />
      ) : null}

      {wabi.sheet === "pain" ? (
        <PainSheet
          items={wabi.painItems}
          itemId={wabi.painItemId}
          onOpenItem={wabi.setPainItemId}
          answer={wabi.painAnswer}
          onBack={wabi.backToPainList}
          onClose={wabi.closePain}
        />
      ) : null}

      {wabi.sheet === "addTask" ? (
        <AddTaskSheet
          title={wabi.addTaskTitle}
          onTitleChange={wabi.setAddTaskTitle}
          phase={wabi.addTaskPhase}
          onPhaseChange={wabi.setAddTaskPhase}
          dueDate={wabi.addTaskDueDate}
          onDueDateChange={wabi.setAddTaskDueDate}
          minDate={wabi.todayIso}
          recommendedTasks={wabi.recommendedTasks}
          selectedRecommendationId={wabi.addTaskSelectedRecommendationId}
          onSelectRecommended={wabi.selectRecommendedTask}
          onSubmit={wabi.submitAddTask}
          onClose={wabi.closeAddTask}
        />
      ) : null}

      {wabi.sheet === "noteEditor" ? (
        <NoteEditorSheet
          isEditing={!!wabi.editingNoteId}
          body={wabi.noteBody}
          onBodyChange={wabi.setNoteBody}
          onSave={wabi.saveNote}
          onClose={wabi.closeNoteEditor}
        />
      ) : null}

      {wabi.sheet === "countryPicker" ? (
        <CountryPickerSheet
          countries={COUNTRIES}
          selectedCode={wabi.country?.code ?? null}
          onSelect={wabi.selectCountry}
          onClose={wabi.closeCountryPickerSheet}
        />
      ) : null}

      {wabi.detailTask ? (
        <TaskDetailScreen
          task={wabi.detailTask}
          done={wabi.detailDone}
          isCustom={wabi.detailIsCustom}
          onClose={wabi.closeDetail}
          onComplete={wabi.completeDetail}
          onUndo={wabi.undoDetail}
          onDelete={wabi.deleteTask}
        />
      ) : null}

      {/* discussion.md 27.2절: 목록 행(ListRow)의 삭제 버튼이 여는 확인 시트 — 상세 화면을
          거치지 않는 별도 경로라 셸 레벨에 공용으로 둔다(TasksScreen·HomeScreen 둘 다 같은
          ListRow를 쓴다). */}
      {wabi.pendingDeleteTask ? (
        <ConfirmSheet
          titleId="list-row-delete-confirm-title"
          title="이 할 일을 삭제할까요?"
          description="삭제하면 되돌릴 수 없습니다."
          confirmLabel="삭제하기"
          onConfirm={wabi.confirmDeleteTask}
          onClose={wabi.cancelDeleteTask}
        />
      ) : null}

      {/* discussion.md 30.2절: window.confirm 대신 ConfirmSheet로 통일한다 — 홈 우측 패널·
          메모 탭 두 곳에서 모두 이 하나의 pending 상태·시트를 공유한다. */}
      {wabi.pendingDeleteNoteId ? (
        <ConfirmSheet
          titleId="note-delete-confirm-title"
          title="이 메모를 삭제할까요?"
          description="삭제하면 되돌릴 수 없습니다."
          confirmLabel="삭제하기"
          onConfirm={wabi.confirmDeleteNote}
          onClose={wabi.cancelDeleteNote}
        />
      ) : null}

      {/* discussion.md 30.2절: 프로필 사진 삭제도 같은 방식으로 옮긴다. */}
      {wabi.pendingAvatarClear ? (
        <ConfirmSheet
          titleId="avatar-clear-confirm-title"
          title="프로필 사진을 삭제할까요?"
          description="삭제하면 되돌릴 수 없습니다."
          confirmLabel="삭제하기"
          onConfirm={wabi.confirmClearAvatar}
          onClose={wabi.cancelClearAvatar}
        />
      ) : null}
    </div>
  );
}
