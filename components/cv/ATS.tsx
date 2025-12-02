'use client';

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Determine background gradient based on score
  const gradientClass =
    score > 69
      ? "from-green-100 dark:from-green-900/40"
      : score > 49
      ? "from-yellow-100 dark:from-yellow-900/40"
      : "from-red-100 dark:from-red-900/40";

  // Determine icon based on score
  const iconSrc =
    score > 69
      ? "/icons/ats-good.svg"
      : score > 49
      ? "/icons/ats-warning.svg"
      : "/icons/ats-bad.svg";

  // Determine subtitle based on score
  const subtitle =
    score > 69 ? "Great Job!" : score > 49 ? "Good Start" : "Needs Improvement";

  return (
    <div
      className={`bg-gradient-to-br ${gradientClass} to-white dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 w-full`}
    >
      {/* Top Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 flex items-center justify-center">
          {score > 69 ? (
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : score > 49 ? (
            <svg className="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ATS Score - {score}/100
          </h2>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Applicant Tracking System Compatibility - {subtitle}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This score represents how well your CV is likely to perform in
          Applicant Tracking Systems used by employers.
        </p>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-3">
            {suggestion.type === "good" ? (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-md text-gray-900 dark:text-white leading-relaxed font-medium">
              {suggestion.tip}
            </p>
          </div>
        ))}
      </div>

      {/* Closing Encouragement */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Keep improving your CV to increase your chances of getting noticed by
          recruiters and passing through automated screening systems.
        </p>
      </div>
    </div>
  );
};

export default ATS;

