'use client';
import React, { useState, useEffect } from 'react';
import TutorSidebar from './TutorSidebar';
import { loadLesson } from '../../utils/lessonParser';

/**
 * TutorSidebar with automatic markdown lesson loading.
 * Parses the lesson file into structured chunks and passes them to TutorSidebar.
 */
export default function TutorSidebarWithLesson({
  isOpen,
  closeModal,
  lessonFilename = 'colormixing-101-combined.md',
  lessonId,
  exerciseId,
  lessonTitle = "Colormixing 101",
  exerciseState = {},
  onLessonComplete,
  onNextExercise,
}) {
  const [chunks, setChunks] = useState([]);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonFilename) {
        setIsLoadingLesson(false);
        return;
      }
      setIsLoadingLesson(true);
      try {
        const parsed = await loadLesson(lessonFilename);
        setChunks(parsed);
      } catch (error) {
        console.error('Error loading lesson:', error);
        setChunks([]);
      } finally {
        setIsLoadingLesson(false);
      }
    }

    if (isOpen) fetchLesson();
  }, [lessonFilename, isOpen]);

  return (
    <TutorSidebar
      isOpen={isOpen}
      closeModal={closeModal}
      lessonId={lessonId}
      exerciseId={exerciseId}
      lessonTitle={lessonTitle}
      chunks={chunks}
      isLoadingLesson={isLoadingLesson}
      exerciseState={exerciseState}
      onLessonComplete={onLessonComplete}
      onNextExercise={onNextExercise}
    />
  );
}
