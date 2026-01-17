import React, { useState, useRef, useEffect } from 'react';
import { CaseScenario, Message, ClinicalPoint, ExamCategory } from '../types';
import { CATEGORY_COLOR_MAP } from '../constants';
import { chatWithPatient, extractClinicalPoints } from '../services/geminiService';

interface ConsultationRoomProps {
  activeCase: CaseScenario;
  onComplete: (points: ClinicalPoint[], history: Message[]) => void;
  onBack: () => void;
}

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ activeCase, onComplete, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'system',
      content: `患者已进入诊室。主诉：${activeCase.patientInfo.chiefComplaint}。请开始问诊。`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedPoints, setCollectedPoints] = useState<ClinicalPoint[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'doctor',
      content: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // 1. Get Patient Response
      const aiResponseText = await chatWithPatient(messages, userMsg.content, activeCase);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'patient',
        content: aiResponseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // 2. Extract Points in background (fire and forget update)
      extractClinicalPoints(userMsg.content, aiResponseText, collectedPoints)
        .then(newPoints => {
          if (newPoints && newPoints.length > 0) {
            setCollectedPoints(prev => {
              // Avoid duplicates based on content similarity or subCategory
              const combined = [...prev];
              newPoints.forEach(np => {
                if (!combined.some(p => p.subCategory === np.subCategory && p.content === np.content)) {
                  combined.push(np);
                }
              });
              return combined;
            });
          }
        });

    } catch (error) {
      console.error("Interaction failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group points by category for display
  const groupedPoints = collectedPoints.reduce((acc, point) => {
    if (!acc[point.category]) acc[point.category] = [];
    acc[point.category].push(point);
    return acc;
  }, {} as Record<ExamCategory, ClinicalPoint[]>);

  const categories = [ExamCategory.WEN_ASK, ExamCategory.WANG, ExamCategory.WEN_SMELL, ExamCategory.QIE];

  return (
    <div className="flex flex-col h-screen md:flex-row bg-slate-50">
      {/* Header Mobile */}
      <div className="md:hidden bg-white p-4 border-b flex justify-between items-center">
        <span className="font-bold text-slate-700">{activeCase.title}</span>
        <button onClick={onBack} className="text-sm text-slate-500">退出</button>
      </div>

      {/* Chat Area (Left/Top) */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full relative">
        <div className="bg-white border-b p-4 shadow-sm z-10 hidden md:flex justify-between items-center">
           <div>
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded">SP</span>
               {activeCase.patientInfo.gender} / {activeCase.patientInfo.age}岁
             </h2>
             <p className="text-xs text-slate-500 mt-1">主诉: {activeCase.patientInfo.chiefComplaint}</p>
           </div>
           <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm">
             结束实训
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
               {msg.role === 'patient' && (
                 <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">
                   患
                 </div>
               )}
               {msg.role === 'system' ? (
                 <div className="w-full text-center text-xs text-slate-400 my-2 italic">
                   {msg.content}
                 </div>
               ) : (
                <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
                  msg.role === 'doctor' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
               )}
               {msg.role === 'doctor' && (
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs ml-2 flex-shrink-0">
                   医
                 </div>
               )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white p-3 rounded-lg border border-slate-200">
                 <div className="flex space-x-1">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="请输入问诊问题，如：平时怕冷吗？"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Clinical Points */}
      <div className="w-full md:w-80 bg-white border-l flex flex-col h-1/3 md:h-full shadow-xl z-20">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-serif font-bold text-slate-800">四诊信息采集</h3>
          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">
            已采集 {collectedPoints.length} 项
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map(cat => {
            const points = groupedPoints[cat] || [];
            return (
              <div key={cat} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat}</h4>
                {points.length === 0 ? (
                  <div className="text-xs text-slate-300 italic pl-2 border-l-2 border-slate-100">暂无信息</div>
                ) : (
                  <div className="space-y-2">
                    {points.map((p) => (
                      <div key={p.id} className={`p-2 rounded text-xs border ${CATEGORY_COLOR_MAP[p.category]} flex flex-col animate-fadeIn`}>
                        <span className="font-bold opacity-70 mb-1">{p.subCategory}</span>
                        <span>{p.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t bg-slate-50">
          <button 
            onClick={() => onComplete(collectedPoints, messages)}
            className="w-full bg-teal-600 text-white py-3 rounded-lg shadow hover:bg-teal-700 font-bold transition-all flex justify-center items-center gap-2"
          >
            <span>确认要点并辨证</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;