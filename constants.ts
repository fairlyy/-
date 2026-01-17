import { CaseScenario, ExamCategory } from './types';

export const MOCK_CASES: CaseScenario[] = [
  {
    id: 'c1',
    title: '风寒感冒（基础难度）',
    difficulty: '基础',
    category: '肺系病证',
    patientInfo: {
      age: 28,
      gender: '男',
      occupation: '公司职员',
      chiefComplaint: '怕冷、头痛2天',
    },
    hiddenProfile: `
      你叫张伟，28岁，是一名程序员。
      两天前因为加班很晚回家，吹了冷风。
      主要症状：
      1. 非常怕冷（恶寒重），穿了两件毛衣还是觉得背部发凉。
      2. 只有轻微发热，或者感觉不到发热。
      3. 完全没有出汗（无汗），皮肤摸起来干干的。
      4. 头痛，特别是后脑勺连着脖子痛（项背强痛），全头都紧绷绷的痛。
      5. 全身骨节酸痛。
      6. 鼻子流清鼻涕，鼻塞声音重。
      7. 嗓子有点痒，想咳嗽，咳出来的痰是稀白的。
      8. 口不渴，想喝热水。
      9. 大小便正常。
      10. 舌苔薄白（如果医生问舌象，描述这个），脉浮紧（如果医生切脉，描述这个）。
      
      性格特点：说话比较直接，语速适中，因为头痛精神不太好。
      回答规则：
      - 只有当医生问到相关症状时才回答，不要一次性把所有症状说完。
      - 如果医生没问到的，不要主动提。
      - 使用通俗语言，不要使用专业术语（如不要说"恶寒"，要说"怕冷"）。
    `,
    standardDiagnosis: {
      syndrome: '风寒束表证',
      treatment: '辛温解表',
      evidence: '恶寒重发热轻，无汗，头痛身痛，鼻塞流清涕，舌苔薄白，脉浮紧。',
    }
  },
  {
    id: 'c2',
    title: '脾胃气虚（进阶难度）',
    difficulty: '进阶',
    category: '脾胃病证',
    patientInfo: {
      age: 45,
      gender: '女',
      occupation: '教师',
      chiefComplaint: '胃口差，饭后腹胀1个月',
    },
    hiddenProfile: `
      你叫李华，45岁，中学老师。
      主要症状：
      1. 最近一个月食欲很差，吃一点就觉得饱。
      2. 饭后肚子胀，尤其是下午更明显。
      3. 经常觉得累，说话声音小（少气懒言）。
      4. 大便稀溏，不成形。
      5. 面色萎黄，没有光泽。
      6. 舌淡苔白，脉弱。
      
      性格：温和，说话轻声细语。
    `,
    standardDiagnosis: {
      syndrome: '脾胃气虚证',
      treatment: '健脾益气',
      evidence: '食少纳呆，脘腹胀满，大便溏薄，神疲乏力，少气懒言，舌淡苔白，脉弱。',
    }
  }
];

// Mapping helper for UI
export const CATEGORY_COLOR_MAP: Record<ExamCategory, string> = {
  [ExamCategory.WANG]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ExamCategory.WEN_SMELL]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ExamCategory.WEN_ASK]: 'bg-teal-100 text-teal-800 border-teal-200',
  [ExamCategory.QIE]: 'bg-orange-100 text-orange-800 border-orange-200',
};