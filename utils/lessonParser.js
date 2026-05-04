/**
 * Parse structured lesson markdown (## [TYPE: label] format) into chunks.
 * Each chunk: { type, label, content, metadata }
 *
 * Supported types: EXPOSITION, CHECKPOINT, ENGAGE, OBSERVE, EXPERIMENT
 */
export function parseLesson(markdownContent) {
  if (!markdownContent || typeof markdownContent !== 'string') return [];

  // If content doesn't use ## [TYPE] markers, fall back to --- section splitting
  if (!markdownContent.includes('## [')) {
    return markdownContent
      .split(/^---\s*$/m)
      .map(section => section.trim())
      .filter(section => section.length > 0)
      .map(content => ({ type: 'EXPOSITION', label: null, content, metadata: {} }));
  }

  // Split on ## [TYPE] or ## [TYPE: label] headings
  // Odd-indexed parts are headers; even-indexed parts (from index 2) are body text
  const parts = markdownContent.split(/^## \[([^\]]+)\]/m);

  const chunks = [];

  for (let i = 1; i < parts.length; i += 2) {
    const header = parts[i].trim();
    const rawBody = parts[i + 1] || '';

    // Strip trailing section separators ("-e", "---", "# Exercise: ...")
    const body = rawBody
      .replace(/-e\s*\n[\s\S]*$/, '')
      .replace(/\n---[\s\S]*$/, '')
      .trim();

    const colonIdx = header.indexOf(':');
    const type = (colonIdx >= 0 ? header.slice(0, colonIdx) : header).trim().toUpperCase();
    const label = colonIdx >= 0 ? header.slice(colonIdx + 1).trim() : null;

    const extractComment = (key) => {
      const re = new RegExp(`<!--\\s*${key}:\\s*([\\s\\S]*?)\\s*-->`);
      const m = body.match(re);
      return m ? m[1].trim() : null;
    };

    const metadata = {};

    // Trigger metadata is available on all chunk types (including EXPOSITION)
    metadata.colorTrigger = extractComment('COLOR_TRIGGER');
    metadata.selectionTrigger = extractComment('SELECTION_TRIGGER');
    metadata.triggerSuccess = extractComment('TRIGGER_SUCCESS');

    const shapeTriggersRaw = extractComment('SHAPE_TRIGGERS');
    if (shapeTriggersRaw) {
      try {
        metadata.shapeTriggers = JSON.parse(shapeTriggersRaw);
      } catch {
        metadata.shapeTriggers = null;
      }
    }

    if (type !== 'EXPOSITION') {
      metadata.aiPrompt = extractComment('AI_PROMPT');
      metadata.context = extractComment('CONTEXT');
      metadata.requiredAction = extractComment('REQUIRED_ACTION');
      metadata.focus = extractComment('FOCUS');
      const pillsRaw = extractComment('PILLS');
      if (pillsRaw) {
        try {
          metadata.pills = JSON.parse(pillsRaw);
        } catch {
          metadata.pills = null;
        }
      }
    }

    chunks.push({
      type,
      label,
      content: type === 'EXPOSITION' ? body : '',
      metadata,
    });
  }

  return chunks;
}

/**
 * Load and parse a lesson file from the API
 * @param {string} lessonFilename - e.g. 'colormixing-101-combined.md'
 * @returns {Promise<Array>} Array of parsed chunks
 */
export async function loadLesson(lessonFilename) {
  try {
    const response = await fetch(`/api/lessons/${lessonFilename}`);
    if (!response.ok) throw new Error(`Failed to load lesson: ${lessonFilename}`);
    const content = await response.text();
    return parseLesson(content);
  } catch (error) {
    console.error('Error loading lesson:', error);
    return [];
  }
}

/**
 * Simple markdown-to-HTML converter for basic formatting.
 * Supports: **bold**, headings, and line breaks.
 */
export function markdownToHTML(markdown) {
  if (!markdown) return '';

  let html = markdown;
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  if (!html.startsWith('<h') && !html.startsWith('<p>')) {
    html = `<p>${html}</p>`;
  }
  return html;
}

/**
 * Get lesson metadata from filename
 */
export function getLessonMetadata(lessonFilename) {
  const basename = lessonFilename.replace('.md', '');
  const parts = basename.split(/[-_]/);
  return {
    id: basename,
    name: parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
    filename: lessonFilename,
  };
}
