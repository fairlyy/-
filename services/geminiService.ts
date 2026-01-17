import { GoogleGenAI, Type } from "@google/genai";
import { Message, ClinicalPoint, ExamCategory, CaseScenario, DiagnosisSubmission, ReportResult } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing!");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Chat with the Simulated Patient
 */
export const chatWithPatient = async (
  history: Message[],
  currentMessage: string,
  caseInfo: CaseScenario
): Promise<string> => {
  const ai = getAI();
  
  const systemInstruction = `
    你正在进行一场中医临床实训角色扮演。
    你的角色是：病人。
    病人资料如下：
    ${caseInfo.hiddenProfile}

    规则：
    1. 你必须严格按照病人资料扮演，不要跳出角色。
    2. 只回答医生（用户）提出的问题，不要主动提供未询问的信息。
    3. 使用口语化、非专业的语言描述症状（例如说“怕冷”而不是“恶寒”）。
    4. 回答要简短自然，模拟真实对话。
    5. 如果医生问了一些与病情无关的问题，礼貌地将话题引回病情。
  `;

  // Convert history to format suitable for prompt context if needed, 
  // but for simple chat, we can just pass the latest context or rely on a new chat session.
  // Ideally, we maintain a Chat Session object, but here we'll use generateContent with history context.
  
  const historyText = history.map(m => `${m.role === 'doctor' ? '医生' : '病人'}: ${m.content}`).join('\n');
  const prompt = `
    ${systemInstruction}
    
    对话历史：
    ${historyText}
    
    医生: ${currentMessage}
    病人:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response for chat
      }
    });
    return response.text || "......";
  } catch (error) {
    console.error("Chat Error:", error);
    return "（病人似乎没有听清，请重试）";
  }
};

/**
 * Extract Clinical Points (Four Examinations) from the latest dialogue
 * Uses JSON mode
 */
export const extractClinicalPoints = async (
  doctorMessage: string,
  patientMessage: string,
  existingPoints: ClinicalPoint[]
): Promise<ClinicalPoint[]> => {
  const ai = getAI();

  const prompt = `
    你是一名专业的中医临床助教。请分析医生和病人的对话，提取出的“四诊”（望、闻、问、切）临床信息。
    
    对话内容：
    医生: ${doctorMessage}
    病人: ${patientMessage}

    请提取对话中病人确认存在的症状或体征。如果是一个否定的回答（例如“我不发烧”），提取为“无发热”。
    不要重复已经提取过的点。
    
    请按以下JSON格式返回提取结果（如果没有新信息，返回空数组）：
    {
      "points": [
        {
          "category": "望诊" | "闻诊" | "问诊" | "切诊",
          "subCategory": "症状归类(如寒热/汗/头身/二便/饮食/胸腹/脉象/舌象)",
          "content": "具体的医学术语描述(如: 恶寒明显, 无汗, 脉浮紧)"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: [ExamCategory.WANG, ExamCategory.WEN_SMELL, ExamCategory.WEN_ASK, ExamCategory.QIE] },
                  subCategory: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const result = JSON.parse(jsonText) as { points: any[] };
    
    // Map to ClinicalPoint type
    return result.points.map((p: any) => ({
      id: Date.now().toString() + Math.random().toString(),
      category: p.category,
      subCategory: p.subCategory,
      content: p.content,
      status: 'detected'
    }));

  } catch (error) {
    console.error("Extraction Error:", error);
    return [];
  }
};

/**
 * Evaluate the diagnosis and generate a report
 */
export const evaluateDiagnosis = async (
  caseInfo: CaseScenario,
  collectedPoints: ClinicalPoint[],
  submission: DiagnosisSubmission
): Promise<ReportResult> => {
  const ai = getAI();

  const prompt = `
    作为中医专家教授，请评估学生提交的辨证结果。

    【病例标准信息】
    标准证候: ${caseInfo.standardDiagnosis.syndrome}
    标准治法: ${caseInfo.standardDiagnosis.treatment}
    标准辨证依据: ${caseInfo.standardDiagnosis.evidence}
    
    【学生采集的四诊信息】
    ${collectedPoints.map(p => `- ${p.category} [${p.subCategory}]: ${p.content}`).join('\n')}
    
    【学生提交的诊断】
    证候: ${submission.syndrome}
    治法: ${submission.treatment}

    请生成JSON评价报告：
    1. 给出一个0-100的分数。
    2. 检查证候是否正确（注意术语规范性，如"风寒感冒"虽然对但不如"风寒束表证"规范，应给予指正）。
    3. 检查治法是否正确。
    4. 构建证据链，解释为何诊断为标准证候。
    5. 指出学生可能遗漏的关键问诊点（基于标准依据里提到但学生未采集的点）。
  `;

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use Pro for complex reasoning/grading
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            syndromeCheck: {
              type: Type.OBJECT,
              properties: {
                studentInput: { type: Type.STRING },
                standard: { type: Type.STRING },
                isCorrect: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING }
              }
            },
            treatmentCheck: {
              type: Type.OBJECT,
              properties: {
                 studentInput: { type: Type.STRING },
                standard: { type: Type.STRING },
                isCorrect: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING }
              }
            },
            evidenceChain: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missedPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI evaluator");
    return JSON.parse(jsonText) as ReportResult;

  } catch (error) {
    console.error("Evaluation Error:", error);
    // Fallback error report
    return {
      score: 0,
      feedback: "评估服务暂时不可用，请稍后重试。",
      syndromeCheck: { studentInput: submission.syndrome, standard: caseInfo.standardDiagnosis.syndrome, isCorrect: false, explanation: "无法评估" },
      treatmentCheck: { studentInput: submission.treatment, standard: caseInfo.standardDiagnosis.treatment, isCorrect: false, explanation: "无法评估" },
      evidenceChain: [],
      missedPoints: []
    };
  }
};