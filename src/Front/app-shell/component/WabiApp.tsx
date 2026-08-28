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
import { TaskDetailScreen } from "@/Front/task-detail/component/TaskDetailScreen";
import { DUE_OPTIONS, useWabiApp } from "@/Front/app-shell/state/useWabiApp";
import styles from "./WabiApp.module.css";

export function WabiApp() {
  const wabi = useWabiApp();

  return (
    <div className={styles.shell}>
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
          />
        ) : null}

        {wabi.tab === "me" ? (
          <MeScreen
            countries={COUNTRIES}
            country={wabi.country}
            countryPickerOpen={wabi.countryPickerOpen}
            onToggleCountryPicker={wabi.toggleCountryPicker}
            onSelectCountry={wabi.selectCountry}
            departureDate={wabi.departureDate}
            departureLabel={wabi.departureLabel}
            visaExpiryLabel={wabi.visaExpiryLabel}
            showVisaLine={wabi.showVisaLine}
            onDepartureDateChange={wabi.setDepartureDate}
          />
        ) : null}
      </main>

      <TabBar active={wabi.tab} onSelect={wabi.goTab} />

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
          body={wabi.noteBody}
          onBodyChange={wabi.setNoteBody}
          onSave={wabi.saveNote}
          onClose={wabi.closeNoteEditor}
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
