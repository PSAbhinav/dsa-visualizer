import * as algorithmCode from '@/data/algorithmCode';
import type { CodeImplementation, ProgrammingLanguage } from '@/data/types';

const validLanguages: ProgrammingLanguage[] = ['python', 'java', 'cpp', 'javascript', 'go'];
const exportedCodeSets = Object.entries(algorithmCode) as [string, CodeImplementation[]][];

describe('algorithm code data', () => {
  it('exports at least one code set', () => {
    expect(exportedCodeSets.length).toBeGreaterThan(0);
  });

  it.each(exportedCodeSets)('%s includes five language implementations', (_, implementations) => {
    expect(implementations).toHaveLength(5);
  });

  it.each(exportedCodeSets)('%s has non-empty code for each implementation', (_, implementations) => {
    implementations.forEach((implementation) => {
      expect(implementation.code.trim().length).toBeGreaterThan(0);
    });
  });

  it.each(exportedCodeSets)('%s uses only supported language values', (_, implementations) => {
    const languages = implementations.map((implementation) => implementation.language).sort();
    expect(languages).toEqual([...validLanguages].sort());
  });
});
