'use client';
import { useState } from 'react';
import TutorSidebarWithLesson from '@/components/Modals/TutorSidebarWithLesson';

export default function TutorTestPage() {
  const [isTutorOpen, setIsTutorOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-8">
      <TutorSidebarWithLesson
        isOpen={isTutorOpen}
        closeModal={() => setIsTutorOpen(false)}
        lessonFilename="1-colormixing-101-ai.md"
        lessonId="1-colormixing-101-ai"
        exerciseId="test_mode"
        lessonTitle="Colormixing 101"
      />

      {/* Main content area */}
      <div className="max-w-4xl w-full">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-4">AI Tutor Test Mode</h1>

          <div className="space-y-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Testing Instructions</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>The AI Tutor sidebar should be open on the left</li>
                <li>Navigate through lesson slides using the "Next" button or arrow keys</li>
                <li>Try asking questions in the chat input at the bottom</li>
                <li>Test the conversation flow with the AI</li>
              </ul>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Test Scenarios</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li><strong>Lesson Navigation:</strong> Click through all slides</li>
                <li><strong>Chat Test:</strong> Ask "What is the Black slider?"</li>
                <li><strong>Guidance Test:</strong> Ask "How do I mix Yellow?"</li>
                <li><strong>Philosophy Test:</strong> Ask "Is my color choice correct?"</li>
              </ul>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Status</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isTutorOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Tutor Sidebar: {isTutorOpen ? 'Open' : 'Closed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Lesson: colormixing_101.md</span>
                </div>
              </div>
            </div>

            {!isTutorOpen && (
              <button
                onClick={() => setIsTutorOpen(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Reopen Tutor Sidebar
              </button>
            )}

            <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-200 mb-2">⚠️ Before Testing Chat:</h3>
              <p className="text-yellow-100 text-sm">
                Make sure you've added the required environment variables to .env.local:
              </p>
              <ul className="list-disc list-inside text-yellow-100 text-sm mt-2 ml-4">
                <li>ANTHROPIC_API_KEY</li>
                <li>SUPABASE_SERVICE_ROLE_KEY</li>
              </ul>
              <p className="text-yellow-100 text-sm mt-2">
                See AI_TUTOR_SETUP.md for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
