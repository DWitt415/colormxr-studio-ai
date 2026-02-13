'use client';

export default function SVGViewerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
