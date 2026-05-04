'use client';
import React, { useState, useEffect, useRef, memo } from 'react';

import ChatInput from './ChatInput';
import ChatMessage, { PillBar } from './ChatMessage';
import supabase from '@/utils/supabase';
import { markdownToHTML } from '../../utils/lessonParser';
import styles from './TutorSidebar.module.css';

// Frozen paragraph — never re-renders after mount, preventing animation restarts
const ParagraphBlock = memo(({ html }) => (
  <div
    className={styles.markdownContent}
    dangerouslySetInnerHTML={{ __html: html }}
  />
), () => true);

// Wrap words in spans for fade-in animation (client-side only)
function wrapWordsForAnimation(html) {
  if (!html || typeof window === 'undefined') return html;

  try {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Shared counter — increments across all text nodes so delay is sequential
    // through the entire content, not resetting at each paragraph or element.
    let wordIndex = 0;

    function wrapTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const words = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();

        words.forEach((word) => {
          if (word.trim()) {
            const span = document.createElement('span');
            span.className = styles.animatedWord;
            span.style.animationDelay = `${wordIndex * 0.015}s`;
            span.textContent = word;
            fragment.appendChild(span);
            wordIndex++;
          } else if (word) {
            fragment.appendChild(document.createTextNode(word));
          }
        });

        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const newNode = node.cloneNode(false);
        Array.from(node.childNodes).forEach(child => {
          const processed = wrapTextNodes(child);
          if (processed instanceof DocumentFragment) {
            newNode.appendChild(processed);
          } else {
            newNode.appendChild(processed);
          }
        });
        return newNode;
      }
      return node.cloneNode(true);
    }

    const processed = document.createElement('div');
    Array.from(temp.childNodes).forEach(child => {
      const result = wrapTextNodes(child);
      if (result instanceof DocumentFragment) {
        processed.appendChild(result);
      } else {
        processed.appendChild(result);
      }
    });

    return processed.innerHTML;
  } catch (e) {
    console.error('Error wrapping words:', e);
    return html;
  }
}

// Convert dot-separated RGB string (e.g. "255.0.0") to CSS rgb() string
function dotColorToRgb(dotColor) {
  if (!dotColor) return null;
  const parts = dotColor.split('.').map(Number);
  if (parts.length !== 3) return null;
  return `rgb(${parts[0]},${parts[1]},${parts[2]})`;
}

// Convert hex color (e.g. "#ff0000") to CSS rgb() string
function hexToRgb(hex) {
  if (!hex) return null;
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgb(${r},${g},${b})`;
}

// Normalise a CSS rgb string for comparison (remove spaces)
function normaliseRgb(rgb) {
  return rgb ? rgb.replace(/\s/g, '').toLowerCase() : '';
}

export default function TutorSidebar({
  isOpen,
  closeModal,
  children,
  lessonId,
  exerciseId,
  lessonTitle = "Colormixing 101",
  chunks = [],
  isLoadingLesson = false,
  exerciseState = {},
  onLessonComplete,
  onNextExercise,
}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revealedHtml, setRevealedHtml] = useState([]);   // accumulated EXPOSITION paragraphs
  const [chunkIdx, setChunkIdx] = useState(0);
  const [mode, setMode] = useState('sequential');          // 'sequential' | 'ai_engaged'
  const [isAnimating, setIsAnimating] = useState(false);  // true while word animation plays

  const messagesEndRef = useRef(null);
  const scrollableRef = useRef(null);
  const slideContainerRef = useRef(null);
  const animTimerRef = useRef(null);

  // Refs for safe use inside async callbacks (avoids stale closures)
  const chunksRef = useRef(chunks);
  const chunkIdxRef = useRef(0);
  const modeRef = useRef('sequential');
  const messagesRef = useRef([]);

  useEffect(() => () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); }, []);
  useEffect(() => { chunksRef.current = chunks; }, [chunks]);
  useEffect(() => { chunkIdxRef.current = chunkIdx; }, [chunkIdx]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // ─── Color trigger polling ────────────────────────────────────────────────
  const colorTriggerFiredRef = useRef(false);
  const colorPollRef = useRef(null);

  // Start/stop the color poll whenever the chunk changes
  useEffect(() => {
    colorTriggerFiredRef.current = false;

    // Clear any existing poll
    if (colorPollRef.current) {
      clearInterval(colorPollRef.current);
      colorPollRef.current = null;
    }

    const chunk = chunksRef.current[chunkIdxRef.current];
    const hasColorTrigger = !!chunk?.metadata?.colorTrigger;
    const hasSelectionTrigger = !!chunk?.metadata?.selectionTrigger;
    const hasShapeTriggers = Array.isArray(chunk?.metadata?.shapeTriggers) && chunk.metadata.shapeTriggers.length > 0;
    if (!hasColorTrigger && !hasSelectionTrigger && !hasShapeTriggers) return;

    const targetRgb = hasColorTrigger
      ? normaliseRgb(dotColorToRgb(chunk.metadata.colorTrigger))
      : null;

    // Pre-compute normalised target rgb for each shape trigger entry
    const shapeTriggerTargets = hasShapeTriggers
      ? chunk.metadata.shapeTriggers.map(t => ({
          index: t.shape,
          rgb: normaliseRgb(hexToRgb(t.color)),
        }))
      : [];

    colorPollRef.current = setInterval(() => {
      if (colorTriggerFiredRef.current) {
        clearInterval(colorPollRef.current);
        colorPollRef.current = null;
        return;
      }
      if (typeof window === 'undefined') return;

      let matched = false;
      let successText = chunk?.metadata?.triggerSuccess || '';

      if (hasShapeTriggers && window.getCurrentColors) {
        const { shapeColors = [] } = window.getCurrentColors();
        const allMatch = shapeTriggerTargets.every(
          ({ index, rgb }) => normaliseRgb(shapeColors[index]) === rgb
        );
        if (allMatch) {
          matched = true;
          if (!successText) successText = 'You got it!';
        }
      }

      if (!matched && hasColorTrigger && window.getCurrentColors) {
        const { shapeColors = [] } = window.getCurrentColors();
        if (shapeColors.some(c => normaliseRgb(c) === targetRgb)) {
          matched = true;
          if (!successText) successText = 'You did it!';
        }
      }

      if (!matched && hasSelectionTrigger && window.getSelectedShape) {
        const selected = window.getSelectedShape();
        if (selected !== null && selected !== 'background') {
          matched = true;
          if (!successText) successText = 'You got it!';
        }
      }

      if (matched) {
        colorTriggerFiredRef.current = true;
        clearInterval(colorPollRef.current);
        colorPollRef.current = null;

        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'assistant',
          content: successText,
          timestamp: new Date().toISOString(),
          isTransient: true,
        }]);
        const capturedIdx = chunkIdxRef.current;
        setTimeout(() => { advanceRef.current(capturedIdx); }, 1200);
      }
    }, 200);

    return () => {
      if (colorPollRef.current) {
        clearInterval(colorPollRef.current);
        colorPollRef.current = null;
      }
    };
  }, [chunkIdx]);

  // ─── Scroll ───────────────────────────────────────────────────────────────

  const scrollToBottom = () => {
    try {
      if (messagesEndRef.current && scrollableRef.current) {
        const endRect = messagesEndRef.current.getBoundingClientRect();
        const containerRect = scrollableRef.current.getBoundingClientRect();
        scrollableRef.current.scrollBy({
          top: endRect.bottom - containerRect.bottom,
          behavior: 'smooth',
        });
      }
    } catch (e) {}
  };

  // After a new paragraph is added, smooth-scroll it to the top of the container
  useEffect(() => {
    if (revealedHtml.length > 1 && slideContainerRef.current && scrollableRef.current) {
      const lastPara = slideContainerRef.current.lastElementChild;
      if (lastPara) {
        const paraRect = lastPara.getBoundingClientRect();
        const containerRect = scrollableRef.current.getBoundingClientRect();
        scrollableRef.current.scrollBy({
          top: paraRect.top - containerRect.top,
          behavior: 'smooth',
        });
      }
    }
  }, [revealedHtml.length]);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (!last.isTransient) scrollToBottom();
    }
  }, [messages]);

  // ─── Chunk processing ─────────────────────────────────────────────────────

  const prefetchCacheRef = useRef({}); // { [chunkIdx]: { response, ui } }

  // Silently pre-fetch the AI response for a future chunk so it's ready on arrival
  const prefetchChunkAI = async (idx) => {
    const chunk = chunksRef.current[idx];
    if (!chunk || chunk.type === 'EXPOSITION') return;
    if (prefetchCacheRef.current[idx]) return; // already fetched

    let prompt = chunk.metadata?.aiPrompt || '';
    if (chunk.metadata?.context) prompt += `\n\nContext: ${chunk.metadata.context}`;
    if (chunk.metadata?.focus) prompt += `\n\nFocus: ${chunk.metadata.focus}`;
    if (!prompt) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const hiddenMsg = {
        role: 'user',
        content: prompt,
        isHidden: true,
        timestamp: new Date().toISOString(),
      };
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          lessonId,
          exerciseId,
          conversationHistory: [...messagesRef.current, hiddenMsg],
          accessToken: session.access_token,
          sessionId: session.user?.id || 'anonymous',
        }),
      });
      if (!response.ok) return;
      const data = await response.json();
      prefetchCacheRef.current[idx] = data;
    } catch {
      // prefetch failures are silent — triggerChunkAI will fall back to a live call
    }
  };

  // Process the chunk at idx: reveal EXPOSITION content or trigger AI
  const processChunk = (idx) => {
    const chunk = chunksRef.current[idx];
    if (!chunk) return;

    if (chunk.type === 'EXPOSITION') {
      // Clear any transient trigger messages from the previous chunk
      setMessages(prev => prev.filter(m => !m.isTransient));

      // Compute animated HTML once here — storing it prevents re-animation on re-renders
      const html = markdownToHTML(chunk.content);
      const animatedHtml = wrapWordsForAnimation(html);
      setRevealedHtml(prev => [...prev, animatedHtml]);
      setMode('sequential');
      modeRef.current = 'sequential';

      // Block clicks until the word animation has finished
      const wordCount = chunk.content.split(/\s+/).filter(Boolean).length;
      const duration = (wordCount - 1) * 15 + 150 + 100; // matches CSS delays + buffer
      setIsAnimating(true);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => setIsAnimating(false), duration);

      // Pre-fetch the next non-EXPOSITION chunk while the user reads
      const nextIdx = idx + 1;
      const nextChunk = chunksRef.current[nextIdx];
      if (nextChunk && nextChunk.type !== 'EXPOSITION') {
        prefetchChunkAI(nextIdx);
      }
    } else {
      setMode('ai_engaged');
      modeRef.current = 'ai_engaged';
      triggerChunkAI(chunk, idx);
    }
  };

  // Advance to the chunk after fromIdx
  const advanceToNext = (fromIdx) => {
    const nextIdx = fromIdx + 1;
    if (nextIdx >= chunksRef.current.length) {
      onLessonComplete?.();
      return;
    }
    chunkIdxRef.current = nextIdx;
    setChunkIdx(nextIdx);
    processChunk(nextIdx);
  };

  // Keep a ref to advanceToNext so async callbacks always call the latest version
  const advanceRef = useRef(advanceToNext);
  useEffect(() => { advanceRef.current = advanceToNext; });

  // Initialize (or reset) when chunks are loaded
  useEffect(() => {
    if (!chunks || chunks.length === 0) {
      setRevealedHtml([]);
      setMessages([]);
      setChunkIdx(0);
      chunkIdxRef.current = 0;
      setMode('sequential');
      modeRef.current = 'sequential';
      return;
    }
    setRevealedHtml([]);
    setMessages([]);
    messagesRef.current = [];
    chunkIdxRef.current = 0;
    setChunkIdx(0);
    setMode('sequential');
    modeRef.current = 'sequential';
    prefetchCacheRef.current = {};
    processChunk(0);
  }, [chunks]);

  // ─── AI auto-trigger ──────────────────────────────────────────────────────

  // Called automatically when a non-EXPOSITION chunk is reached.
  // Uses a prefetched response if available, otherwise calls the API live.
  const triggerChunkAI = async (chunk, idx) => {
    // Build instruction prompt from chunk metadata
    let prompt = chunk.metadata?.aiPrompt || '';
    if (chunk.metadata?.context) prompt += `\n\nContext: ${chunk.metadata.context}`;
    if (chunk.metadata?.focus) prompt += `\n\nFocus: ${chunk.metadata.focus}`;
    if (!prompt) return;

    const hiddenMsg = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      isHidden: true,
      timestamp: new Date().toISOString(),
    };

    // Use prefetched response if ready
    const cached = prefetchCacheRef.current[idx];
    if (cached) {
      delete prefetchCacheRef.current[idx];
      setMessages(prev => [...prev, hiddenMsg]);
      const pills = chunk.metadata?.pills;
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: cached.response,
        timestamp: new Date().toISOString(),
        ui: pills ? { type: 'pills', options: pills } : null,
      }]);
      return;
    }

    // No cached response — fall back to live call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const historyForAPI = [...messagesRef.current, hiddenMsg];
    setMessages(prev => [...prev, hiddenMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          lessonId,
          exerciseId,
          conversationHistory: historyForAPI,
          accessToken: session.access_token,
          sessionId: session.user?.id || 'anonymous',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      // Pills must be explicitly defined in the markdown chunk — never use AI-generated pills
      const pills = chunk.metadata?.pills;
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        ui: pills ? { type: 'pills', options: pills } : null,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error in auto-triggered AI:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── User message ─────────────────────────────────────────────────────────

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Capture mode and position at call time (before async state changes)
    const wasAiEngaged = modeRef.current === 'ai_engaged';
    const capturedChunkIdx = chunkIdxRef.current;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '🔐 Please log in to use the chat feature.',
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          lessonId,
          exerciseId,
          conversationHistory: messagesRef.current,
          accessToken: session.access_token,
          sessionId: session.user?.id || 'anonymous',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        ui: data.ui || null,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // After AI responds to a user message in ai_engaged mode, advance to next chunk
      if (wasAiEngaged) {
        advanceRef.current(capturedChunkIdx);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      let errorContent = 'Sorry, I encountered an error. Please try again.';
      if (error.message.includes('AI service not configured')) {
        errorContent = '⚙️ The AI service is not configured yet. Please add the ANTHROPIC_API_KEY to your environment variables.';
      } else if (error.message.includes('Rate limit')) {
        errorContent = '⏱️ You\'ve reached the message limit for this session. Please start a new session.';
      } else if (error.message.includes('Message too long')) {
        errorContent = '📏 Your message is too long. Please keep it under 500 characters.';
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Pill click ───────────────────────────────────────────────────────────

  const LESSON_COMPLETE_PILLS = ["I'm ready to move on", "I'm done", "I'm ready for the next lesson"];

  // In ai_engaged mode, pills send to the AI so it can respond (e.g. correct a wrong answer).
  // In sequential mode, pills just record the choice and advance.
  const handlePillClick = (option) => {
    if (LESSON_COMPLETE_PILLS.includes(option)) {
      onLessonComplete?.();
      return;
    }
    setPillsDismissed(true);
    if (modeRef.current === 'ai_engaged') {
      handleSendMessage(option);
      return;
    }
    const capturedChunkIdx = chunkIdxRef.current;
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: option,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    advanceRef.current(capturedChunkIdx);
  };

  // ─── Interaction ──────────────────────────────────────────────────────────

  const handleContentClick = (e) => {
    if (modeRef.current !== 'sequential' || isAnimating) return;
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button') ||
      e.target.closest('input')
    ) return;
    advanceToNext(chunkIdxRef.current);
  };

  const hasMore = mode === 'sequential' && chunkIdx < chunks.length - 1;
  const visibleMessages = messages.filter(m => !m.isHidden);

  // Find the most recent assistant message that has pills
  const lastPillMessage = [...visibleMessages].reverse().find(
    m => m.role === 'assistant' && m.ui?.type === 'pills' && m.ui?.options?.length
  );

  const [pillsDismissed, setPillsDismissed] = useState(false);
  const lastPillIdRef = useRef(null);

  // Reset dismissed state whenever a new pill message arrives
  useEffect(() => {
    if (lastPillMessage?.id !== lastPillIdRef.current) {
      lastPillIdRef.current = lastPillMessage?.id ?? null;
      setPillsDismissed(false);
    }
  }, [lastPillMessage?.id]);

  const activePills = !pillsDismissed && lastPillMessage ? lastPillMessage.ui.options : null;

  if (!isOpen) return null;

  return (
    <div className={styles.dialogContainer} style={{ pointerEvents: 'none' }}>
      <div className={styles.sidebar} style={{ pointerEvents: 'auto' }}>
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>{lessonTitle}</h2>
            <button
              onClick={closeModal}
              className={styles.closeButton}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Unified Content Area */}
          <div className={styles.unifiedContent}>
            <div
              className={styles.scrollableContent}
              ref={scrollableRef}
              onClick={handleContentClick}
              style={{ cursor: hasMore ? 'pointer' : 'default' }}
            >
              {/* Lesson content */}
              <div className={styles.slideContainer} ref={slideContainerRef}>
                {isLoadingLesson ? (
                  <div className={styles.markdownContent}>
                    <p>Loading lesson content...</p>
                  </div>
                ) : chunks.length > 0 ? (
                  revealedHtml.map((animatedHtml, index) => (
                    <ParagraphBlock key={`para-${index}`} html={animatedHtml} />
                  ))
                ) : (
                  children
                )}
              </div>

              {/* AI messages integrated with lesson content */}
              {visibleMessages.length > 0 && (
                <div className={styles.messagesFlow}>
                  {visibleMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                    />
                  ))}
                </div>
              )}

              {isLoading && (
                <div className={styles.loadingIndicator}>
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
              {activePills && (
                <PillBar options={activePills} onPillClick={handlePillClick} />
              )}
              {hasMore && (
                <div className={styles.continueHint}>
                  Tap or click anywhere to continue
                </div>
              )}
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide wrapper component (kept for compatibility)
export function Slide({ children }) {
  return (
    <div className={styles.slide}>
      {children}
    </div>
  );
}
