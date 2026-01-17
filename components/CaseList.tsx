import React from 'react';
import { CaseScenario } from '../types';
import { MOCK_CASES } from '../constants';

interface CaseListProps {
  onSelectCase: (c: CaseScenario) => void;
}

const CaseList: React.FC<CaseListProps> = ({ onSelectCase }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">临床实训病例库</h1>
      <p className="text-slate-500 mb-8">请选择一个病例开始模拟接诊。系统将根据你的问诊过程自动评估。</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_CASES.map((scenario) => (
          <div 
            key={scenario.id} 
            onClick={() => onSelectCase(scenario)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                scenario.difficulty === '基础' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {scenario.difficulty}
              </span>
              <span className="text-slate-400 text-sm">{scenario.category}</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-700 mb-2">
              {scenario.title}
            </h3>
            
            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold">患者:</span> {scenario.patientInfo.gender}，{scenario.patientInfo.age}岁，{scenario.patientInfo.occupation}</p>
              <p><span className="font-semibold">主诉:</span> {scenario.patientInfo.chiefComplaint}</p>
            </div>

            <div className="mt-6 flex items-center text-teal-600 font-medium text-sm">
              开始接诊 
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseList;