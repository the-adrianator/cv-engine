"use client";

import type { Feedback } from "@/types";
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor =
    score > 70
      ? "text-green-600 dark:text-green-400"
      : score > 49
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400";
  return (
    <div className="flex flex-row items-center justify-center p-4 gap-4">
      <div className="flex flex-row gap-2 items-center justify-between w-full rounded-2xl p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-2xl text-gray-900 dark:text-white font-semibold">
            {title}
          </p>
          <ScoreBadge score={score} />
        </div>
        <p className="text-2xl font-bold">
          <span className={textColor}>{score}</span>
          <span className="text-gray-600 dark:text-gray-400">/100</span>
        </p>
      </div>
    </div>
  );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={feedback.overallScore} />

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your CV Score
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This score is calculated based on the variables listed below.
          </p>
        </div>
      </div>

      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  );
};

export default Summary;
