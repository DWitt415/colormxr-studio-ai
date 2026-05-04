'use client';
import React from 'react';
import styles from './ChatMessage.module.css';

// Simple markdown converter for AI responses
function formatMessage(text) {
  if (!text) return '';

  let formatted = text;

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}

export default function ChatMessage({ message }) {
  const { role, content, isError } = message;
  const isUser = role === 'user';

  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      <div className={styles.messageContent}>
        <div className={styles.bubble}>
          {isUser ? (
            <p className={styles.text}>{content}</p>
          ) : (
            <div
              className={`${styles.text} ${isError ? styles.errorText : ''}`}
              dangerouslySetInnerHTML={{ __html: formatMessage(content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function PillBar({ options, onPillClick }) {
  if (!options || options.length === 0) return null;
  return (
    <div className={styles.pillsContainer}>
      {options.map((option, index) => (
        <button
          key={index}
          className={styles.pill}
          onClick={() => onPillClick?.(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
