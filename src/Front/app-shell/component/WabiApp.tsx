"use client";

import { COUNTRIES } from "@/Front/common/data/tasks";
import { TabBar } from "@/Front/common/component/TabBar";
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
import { DUE_OPTIONS, useWabiApp } from "@/Front/app-shell/state/useWabiApp";
import styles from "./WabiApp.module.css";

export function WabiApp() {
  const wabi = useWabiApp();

  return (
    <div className={styles.shell}>
      {/*
        discussion.md 11.5절/11.6절: 데스크톱 우측 336px 패널은 화면 공용 컴포넌트가 아니다.
        아래 네 화면은 각자 자기 컴포넌트 파일 안에 own aside를 넣거나(HomeScreen, NotesScreen)
        아예 넣지 않는다(TasksScreen, MeScreen) — WabiApp이나 <main>에는 패널 마크업이 없다.
        새 화면을 추가할 때 이 우측 패널이 "기본으로 딸려오는" 통로는 존재하지 않으므로,
        패널이 필요하면 그 화면의 .tsx/.module.css 안에 명시적으로 새로 만들어야 한다.
        (홈 = 내 메모 패널, 메모 = WRITING 패널, 할 일·나 = 패널 없음.)
      */}
      <main className={styles.content}>
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
            onOpenDetail={wabi.openDetail}
            onOpenGuide={wabi.openGuide}
            onOpenPain={wabi.openPain}
            onGoTasks={() => wabi.goTab("tasks")}
            onOpenCountryPicker={wabi.openCountryPickerSheet}
            notes={wabi.notes}
            onOpenAddNote={wabi.openAddNote}
            onOpenEditNote={wabi.openEditNote}
            onQuickAddNote={wabi.quickAddNote}
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
            onOpenDetail={wabi.openDetail}
            onOpenAddTask={wabi.openAddTask}
          />
        ) : null}

        {wabi.tab === "notes" ? (
          <NotesScreen
            notes={wabi.notes}
            onOpenAdd={wabi.openAddNote}
            onOpenEdit={wabi.openEditNote}
            onDelete={wabi.deleteNote}
            panelTitle={wabi.noteTitle}
            panelBody={wabi.noteBody}
            onPanelTitleChange={wabi.setNoteTitle}
            onPanelBodyChange={wabi.setNoteBody}
            onPanelSave={wabi.saveNote}
            isPanelEditing={!!wabi.editingNoteId}
            onPanelDelete={() => wabi.editingNoteId && wabi.deleteNote(wabi.editingNoteId)}
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
          />
        ) : null}
      </main>

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
          due={wabi.addTaskDue}
          onDueChange={wabi.setAddTaskDue}
          dueOptions={DUE_OPTIONS}
          onSubmit={wabi.submitAddTask}
          onClose={wabi.closeAddTask}
        />
      ) : null}

      {wabi.sheet === "noteEditor" ? (
        <NoteEditorSheet
          isEditing={!!wabi.editingNoteId}
          title={wabi.noteTitle}
          onTitleChange={wabi.setNoteTitle}
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
          onClose={wabi.closeDetail}
          onComplete={wabi.completeDetail}
          onUndo={wabi.undoDetail}
        />
      ) : null}
    </div>
  );
}
