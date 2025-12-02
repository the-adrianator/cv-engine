'use client';

import Link from "next/link";
import ScoreCircle from "./ScoreCircle";

interface CVCardProps {
  resume: Resume;
}

const CVCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: CVCardProps) => {
  // For now, we'll use the imagePath directly
  // Later, we'll fetch from Supabase Storage
  const imageUrl = imagePath.startsWith("/images/") 
    ? imagePath 
    : imagePath; // Will be Supabase URL later

  return (
    <Link
      href={`/cv/${id}`}
      className="flex flex-col gap-8 h-[560px] w-[350px] lg:w-[430px] xl:w-[490px] rounded-2xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex flex-row gap-2 justify-between min-h-[110px] max-sm:flex-col items-center max-md:justify-center max-md:items-center">
        <div className="flex flex-col gap-2">
          {companyName && (
            <h2 className="text-gray-900 dark:text-white font-bold break-words">
              {companyName}
            </h2>
          )}
          {jobTitle && (
            <h3 className="text-lg break-words text-gray-600 dark:text-gray-400">{jobTitle}</h3>
          )}
          {!companyName && !jobTitle && (
            <h3 className="text-lg break-words text-gray-600 dark:text-gray-400">CV</h3>
          )}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
        <div className="w-full h-full">
          <img
            src={imageUrl}
            alt="cv"
            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top rounded-lg"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = "/images/resume-scan-2.gif";
            }}
          />
        </div>
      </div>
    </Link>
  );
};

export default CVCard;

