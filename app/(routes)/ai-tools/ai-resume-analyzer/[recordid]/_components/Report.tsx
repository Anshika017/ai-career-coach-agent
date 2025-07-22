import { Button } from '@/components/ui/button';
import {
  Sparkle,
  ArrowUpRight,
  CheckCircle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import React, { useState } from 'react';
import clsx from 'clsx';
import ResumeUploadDialog from '@/app/(routes)/dashboard/_components/ResumeUploadDialog';

interface Section {
  score: number;
  comment: string;
  needs_improvement?: string[];
  whats_good?: string[];
}

interface AIReport {
  overall_score: number;
  overall_feedback: string;
  summary_comment: string;
  content?: {
    needs_improvement?: string[];
    whats_good?: string[];
  };
  needs_improvement?: string[];
  whats_good?: string[];
  tips_for_improvement?: string[];
  sections?: Record<string, Section>;
}

interface ReportProps {
  aiReport: AIReport;
}

function Report({ aiReport }: ReportProps) {

  const[openResumeUpload,setOpenResumeDialog]=useState(false);

  const getStatusColor = (per: number) => {
    if (per < 60) return 'rose';
    if (per <= 80) return 'amber';
    return 'emerald';
  };

  const sections: Record<string, Section> = aiReport?.sections || {};

  const needsImprovementList =
    aiReport?.needs_improvement ||
    aiReport?.content?.needs_improvement ||
    sections?.experience?.needs_improvement ||
    [];

  const whatsGoodList =
    aiReport?.whats_good ||
    sections?.experience?.whats_good ||
    aiReport?.content?.whats_good ||
    [];

  const tipsList = aiReport?.tips_for_improvement || [];

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-gray-800">AI Analysis Results</h2>
        <Button type="button" onClick={ () => setOpenResumeDialog(true)}>
          Re-analyze <Sparkle className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-[#BE575F] via-[#A338E3] to-[#AC76D6] rounded-lg shadow-md p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkle className="text-yellow-300" /> Overall Score
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-6xl font-extrabold text-white">
            {aiReport?.overall_score}<span className="text-2xl">/100</span>
          </span>
          <div className="flex items-center text-green-300 font-semibold">
            <ArrowUpRight className="mr-2 h-5 w-5" />
            {aiReport?.overall_feedback}
          </div>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2.5 mb-4">
          <div
            className="bg-white h-2.5 rounded-full"
            style={{ width: `${aiReport?.overall_score}%` }}
          ></div>
        </div>
        <p className="text-white text-sm">{aiReport?.summary_comment}</p>
      </div>

      {/* Section Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(sections).map(([key, value]: [string, Section]) => {
          const color = getStatusColor(value.score);

          return (
            <div
              key={key}
              className={clsx(
                'bg-white rounded-lg shadow-md p-5 relative overflow-hidden group border',
                {
                  'border-rose-200': color === 'rose',
                  'border-amber-200': color === 'amber',
                  'border-emerald-200': color === 'emerald',
                }
              )}
            >
              <h4 className="text-lg font-semibold text-gray-700 mb-3 capitalize">
                {key.replace('_', ' ')}
              </h4>
              <span className="text-4xl font-bold">{value.score}%</span>
              <p className="text-sm text-gray-600 mt-2">{value.comment}</p>
              <div
                className={clsx(
                  'absolute inset-x-0 bottom-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100',
                  {
                    'bg-rose-500': color === 'rose',
                    'bg-amber-500': color === 'amber',
                    'bg-emerald-500': color === 'emerald',
                  }
                )}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Tips for Improvement */}
      {tipsList.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Lightbulb className="text-orange-400" /> Tips for Improvement
          </h3>
          <ol className="space-y-4">
            {tipsList.map((item: string, index: number) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-800 text-sm">{item}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* What's Good / Needs Improvement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-5 border border-green-200">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ThumbsUp className="text-green-500" /> What's Good
          </h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
            {whatsGoodList.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 border border-rose-200">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ThumbsDown className="text-red-500" /> Needs Improvement
          </h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
            {needsImprovementList.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Premium CTA */}
      <div className="bg-blue-600 text-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to refine your resume?</h3>
        <p className="text-base mb-4">
          Make your application stand out with our premium insights and features.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-full hover:bg-gray-100 transition"
        >
          Upgrade to Premium
          <ArrowUpRight className="ml-2 h-4 w-4 text-blue-600" />
        </button>
      </div>
      <ResumeUploadDialog openResumeUpload={openResumeUpload} setOpenResumeDialog={()=>setOpenResumeDialog(false)}/>
    </div>
  );
}

export default Report;
