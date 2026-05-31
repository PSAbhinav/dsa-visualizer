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

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration?: string;
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
  youtubeVideos: YouTubeVideo[];
  algorithms: Algorithm[];
  problems: Problem[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Quiz {
  topicSlug: string;
  questions: QuizQuestion[];
}
