"use client"
import { useAppMode } from '../providers/AppModeProvider';

export default function DemoModeBanner() {
  const { isDemoMode, toggleMode } = useAppMode();

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 dark:from-yellow-600 dark:via-orange-600 dark:to-red-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">
              Demo Mode Active
            </h3>
            <div className="mt-1 text-sm opacity-90">
              You're viewing SYMFARMIA with sample data. No real data will be saved or modified.
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <button
            onClick={toggleMode}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Switch to Live Mode
          </button>
          <a
            href="?demo=false"
            className="text-white hover:text-yellow-200 text-sm underline"
          >
            Exit Demo
          </a>
        </div>
      </div>
    </div>
  );
}