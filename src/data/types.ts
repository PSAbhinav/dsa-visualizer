export type Level = "beginner" | "intermediate" | "advanced" | "pro";

export type ProgrammingLanguage = "python" | "java" | "cpp" | "javascript" | "go";

export interface CodeImplementation {
  language: ProgrammingLanguage;
  code: string;
}

export interface Algorithm {
  name: string;
  pseudocode: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  code?: CodeImplementation[];
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  leetcodeUrl?: string;
  hints: string[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
}

export interface Topic {
  slug: string;
  title: string;
  level: Level;
  icon: string;
  color: string;
  shortDescription: string;
  detailedExplanation: string;
  realWorldAnalogy: string;
  visualizerType: string;
  algorithms: Algorithm[];
  problems: Problem[];
}
