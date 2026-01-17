import React from 'react';
import { ReportResult, CaseScenario } from '../types';

interface ReportViewProps {
  report: ReportResult;
  caseInfo: CaseScenario;
  onRestart: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ report, caseInfo, onRestart }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800">实训评估报告</h1>
            <p className="text-slate-500">病例: {caseInfo.title}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
               <div className="text-xs text-slate-400 uppercase">综合得分</div>
               <div className={`text-3xl font-bold ${report.score >= 80 ? 'text-green-600' : report.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                 {report.score} <span className="text-sm text-slate-400 font-normal">/ 100</span>
               </div>
             </div>
             <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                report.score >= 80 ? 'bg-green-500' : report.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
             }`}>
                {report.score >= 90 ? 'A' : report.score >= 80 ? 'B' : report.score >= 60 ? 'C' : 'D'}
             </div>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Syndrome Check */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              证候诊断
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded">
                  <div className="text-xs text-slate-400 mb-1">你的答案</div>
                  <div className="font-medium">{report.syndromeCheck.studentInput}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                  <div className="text-xs text-blue-400 mb-1">标准参考</div>
                  <div className="font-medium text-blue-800">{report.syndromeCheck.standard}</div>
                </div>
              </div>
              <div className={`text-sm p-3 rounded ${report.syndromeCheck.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <span className="font-bold">评估: </span>{report.syndromeCheck.explanation}
              </div>
            </div>
          </div>

          {/* Treatment Check */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-teal-500">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              治法
            </h3>
             <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded">
                  <div className="text-xs text-slate-400 mb-1">你的答案</div>
                  <div className="font-medium">{report.treatmentCheck.studentInput}</div>
                </div>
                <div className="p-3 bg-teal-50 rounded border border-teal-100">
                  <div className="text-xs text-teal-400 mb-1">标准参考</div>
                  <div className="font-medium text-teal-800">{report.treatmentCheck.standard}</div>
                </div>
              </div>
              <div className={`text-sm p-3 rounded ${report.treatmentCheck.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <span className="font-bold">评估: </span>{report.treatmentCheck.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Chain */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4 text-slate-800">标准证据链推演</h3>
          <div className="space-y-3">
            {report.evidenceChain.map((ev, idx) => (
              <div key={idx} className="flex gap-3">
                 <div className="flex flex-col items-center">
                   <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                   {idx !== report.evidenceChain.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1"></div>}
                 </div>
                 <p className="text-slate-700 text-sm py-0.5">{ev}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Missed Points */}
        {report.missedPoints.length > 0 && (
          <div className="bg-orange-50 rounded-xl shadow-sm p-6 border border-orange-100">
             <h3 className="font-bold text-lg mb-2 text-orange-800">问诊查漏补缺</h3>
             <p className="text-orange-700 text-sm mb-3">你在问诊过程中可能遗漏了以下关键点：</p>
             <ul className="list-disc list-inside space-y-1">
               {report.missedPoints.map((mp, idx) => (
                 <li key={idx} className="text-orange-800 text-sm">{mp}</li>
               ))}
             </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center pt-8 pb-12">
          <button 
            onClick={onRestart}
            className="bg-slate-800 text-white px-8 py-3 rounded-full shadow-lg hover:bg-slate-700 font-bold transition-all"
          >
            返回病例列表
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportView;