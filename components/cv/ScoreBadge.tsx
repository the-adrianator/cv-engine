'use client';

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeStyle = "";
  let label = "";

  if (score > 69) {
    badgeStyle = "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800";
    label = "Strong";
  } else if (score > 49) {
    badgeStyle = "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
    label = "Good Start";
  } else {
    badgeStyle = "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800";
    label = "Needs Work";
  }

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 ${badgeStyle}`}
    >
      <p>{label}</p>
    </div>
  );
};

export default ScoreBadge;

