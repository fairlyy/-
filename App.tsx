import React, { useState } from 'react';
import { AppStep, CaseScenario, ClinicalPoint, DiagnosisSubmission, Message, ReportResult, HistoryRecord } from './types';
import CaseList from './components/CaseList';
import ConsultationRoom from './components/ConsultationRoom';
import DiagnosisForm from './components/DiagnosisForm';
import ReportView from './components/ReportView';
import { evaluateDiagnosis } from './services/geminiService';
import { MOCK_CASES } from './constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.CASE_SELECTION);
  const [selectedCase, setSelectedCase] = useState<CaseScenario | null>(null);
  const [collectedPoints, setCollectedPoints] = useState<ClinicalPoint[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  // Navigation handlers
  const handleSelectCase = (scenario: CaseScenario) => {
    setSelectedCase(scenario);
    setCollectedPoints([]);
    setChatHistory([]);
    setReport(null);
    setCurrentStep(AppStep.CONSULTATION);
  };

  const handleConsultationComplete = (points: ClinicalPoint[], history: Message[]) => {
    setCollectedPoints(points);
    setChatHistory(history);
    setCurrentStep(AppStep.DIAGNOSIS);
  };

  const handleDiagnosisSubmit = async (submission: DiagnosisSubmission) => {
    if (!selectedCase) return;
    
    // Call AI to evaluate
    const result = await evaluateDiagnosis(selectedCase, collectedPoints, submission);
    setReport(result);

    // Save history
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      caseId: selectedCase.id,
      date: new Date().toLocaleDateString(),
      messages: chatHistory,
      points: collectedPoints,
      submission,
      report: result
    };
    setHistoryRecords(prev => [newRecord, ...prev]);

    setCurrentStep(AppStep.REPORT);
  };

  const handleRestart = () => {
    setCurrentStep(AppStep.CASE_SELECTION);
    setSelectedCase(null);
  };

  // Render Logic
  return (
    <div className="min-h-screen font-sans text-slate-800">
       {/* Top Bar (Simple) */}
       {currentStep === AppStep.CASE_SELECTION && (
         <header className="bg-white border-b py-4 px-6 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg">岐</div>
               <span className="font-bold text-xl tracking-tight text-slate-800">岐黄问对</span>
            </div>
            {historyRecords.length > 0 && (
              <button 
                onClick={() => setCurrentStep(AppStep.HISTORY)}
                className="text-sm text-slate-500 hover:text-teal-600"
              >
                历史记录 ({historyRecords.length})
              </button>
            )}
         </header>
       )}

      {currentStep === AppStep.CASE_SELECTION && (
        <CaseList onSelectCase={handleSelectCase} />
      )}

      {currentStep === AppStep.CONSULTATION && selectedCase && (
        <ConsultationRoom 
          activeCase={selectedCase} 
          onComplete={handleConsultationComplete}
          onBack={handleRestart}
        />
      )}

      {currentStep === AppStep.DIAGNOSIS && (
        <DiagnosisForm 
          collectedPoints={collectedPoints}
          onSubmit={handleDiagnosisSubmit}
          onBack={() => setCurrentStep(AppStep.CONSULTATION)}
        />
      )}

      {currentStep === AppStep.REPORT && report && selectedCase && (
        <ReportView 
          report={report} 
          caseInfo={selectedCase} 
          onRestart={handleRestart}
        />
      )}

      {currentStep === AppStep.HISTORY && (
        <div className="max-w-4xl mx-auto p-6">
           <button onClick={() => setCurrentStep(AppStep.CASE_SELECTION)} className="mb-4 text-teal-600 font-bold">&larr; 返回</button>
           <h2 className="text-2xl font-bold mb-6">历史实训记录</h2>
           <div className="space-y-4">
             {historyRecords.map(rec => (
               <div key={rec.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                 <div>
                    <div className="font-bold text-lg">{MOCK_CASES.find(c => c.id === rec.caseId)?.title || '未知病例'}</div>
                    <div className="text-sm text-slate-500">{rec.date} | 得分: {rec.report.score}</div>
                 </div>
                 <button 
                   onClick={() => {
                     setSelectedCase(MOCK_CASES.find(c => c.id === rec.caseId) || null);
                     setReport(rec.report);
                     setCurrentStep(AppStep.REPORT);
                   }}
                   className="px-4 py-2 border rounded hover:bg-slate-50 text-sm"
                 >
                   查看详情
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default App;