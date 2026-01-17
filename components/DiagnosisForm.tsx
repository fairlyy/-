import React, { useState } from 'react';
import { ClinicalPoint, DiagnosisSubmission } from '../types';
import { CATEGORY_COLOR_MAP } from '../constants';

interface DiagnosisFormProps {
  collectedPoints: ClinicalPoint[];
  onSubmit: (submission: DiagnosisSubmission) => void;
  onBack: () => void;
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ collectedPoints, onSubmit, onBack }) => {
  const [syndrome, setSyndrome] = useState('');
  const [treatment, setTreatment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!syndrome.trim() || !treatment.trim()) return;
    setIsSubmitting(true);
    onSubmit({ syndrome, treatment });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-teal-700 p-6 text-white">
          <h2 className="text-2xl font-serif font-bold">辨证论治提交</h2>
          <p className="text-teal-100 mt-1 opacity-80">请根据采集到的四诊信息，给出你的诊断和治法。</p>
        </div>

        <div className="p-8">
          {/* Summary of Collected Info */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">已采集的四诊摘要</h3>
            <div className="flex flex-wrap gap-2">
              {collectedPoints.length > 0 ? collectedPoints.map((p) => (
                <span key={p.id} className={`px-2 py-1 rounded text-xs border ${CATEGORY_COLOR_MAP[p.category]}`}>
                  {p.category}: {p.content}
                </span>
              )) : (
                <span className="text-slate-400 italic text-sm">未采集到有效信息（这可能会影响诊断得分）</span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-slate-700 font-bold mb-2">
                中医辨证 (证候) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={syndrome}
                onChange={(e) => setSyndrome(e.target.value)}
                placeholder="例如：风寒束表证"
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">请使用规范的中医证候术语。</p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">
                治法 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="例如：辛温解表"
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              返回修改要点
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !syndrome.trim() || !treatment.trim()}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 font-bold shadow-md transition-all flex justify-center items-center"
            >
              {isSubmitting ? (
                 <span className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   AI 正在评估中...
                 </span>
              ) : '提交辨证'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisForm;