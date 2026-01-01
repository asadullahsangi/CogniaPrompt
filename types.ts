
export interface OptimizationResult {
  optimizedPrompt: string;
  reasoning: string;
  score: number;
  tips: string[];
  variants: {
    label: string;
    content: string;
  }[];
}

export interface PromptHistoryItem {
  id: string;
  original: string;
  result: OptimizationResult;
  timestamp: number;
  tag?: string;
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  CREATIVE = 'Creative',
  CONCISE = 'Concise',
  INSTRUCTIONAL = 'Instructional',
  ACADEMIC = 'Academic'
}

export enum Role {
  GENERAL = 'General AI',
  EXPERT_CODER = 'Expert Developer',
  WRITER = 'Creative Writer',
  DATA_SCIENTIST = 'Data Scientist',
  MARKETER = 'Marketing Strategist'
}
