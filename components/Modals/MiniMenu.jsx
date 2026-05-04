'use client';
import React from 'react';
import styles from './MiniMenu.module.css';

const SECTIONS = [
  { id: 'primary',         title: 'Mixing Primary Colors' },
  { id: 'secondary',  title: 'Making Secondary Colors' },
  { id: 'subtraction',        title: 'Color by Subtraction' },
  { id: 'relationships',      title: 'Primary & Secondary Relationships' },
  { id: 'phantom-colors',     title: "'Phantom' Complementary Colors" },
  { id: 'complex-complement', title: 'Complex Complementary Colors' },
  { id: 'color-wheel',        title: 'Building the Color Wheel' },
];

export { SECTIONS };

/**
 * @param {{ isOpen: boolean, completedIds: string[], onSelectSection: (idx: number) => void }} props
 */
export default function MiniMenu({ isOpen, completedIds = /** @type {string[]} */ ([]), onSelectSection }) {
  if (!isOpen) return null;

  return (
    <div className={styles.dialogContainer} style={{ pointerEvents: 'none' }}>
      <div className={styles.sidebar} style={{ pointerEvents: 'auto' }}>
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Colormixing 101</h2>
          </div>

          {/* Section list */}
          <div className={styles.list}>
            {SECTIONS.map((section, index) => {
              const done = completedIds.includes(section.id);
              return (
                <button
                  key={section.id}
                  className={styles.item}
                  onClick={() => onSelectSection(index)}
                >
                  <span className={styles.icon}>
                    {done ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="9" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
                        <path d="M6 10.5L8.5 13L14 7.5" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none"/>
                      </svg>
                    )}
                  </span>
                  <span className={`${styles.label} ${done ? styles.labelDone : ''}`}>
                    {section.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
