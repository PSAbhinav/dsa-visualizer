import { render } from '@testing-library/react';
import React from 'react';

jest.mock('framer-motion', () => {
  const React = require('react');

  const motionPropNames = new Set([
    'animate',
    'exit',
    'initial',
    'layout',
    'layoutId',
    'transition',
    'variants',
    'whileDrag',
    'whileHover',
    'whileInView',
    'whileTap',
  ]);

  const motion = new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef(function MockMotionComponent(
          { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
          ref: React.ForwardedRef<HTMLElement>
        ) {
          const domProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !motionPropNames.has(key))
          );

          return React.createElement(tag, { ref, ...domProps }, children);
        }),
    }
  );

  return {
    __esModule: true,
    AnimatePresence: ({ children }: React.PropsWithChildren) => children,
    motion,
  };
});

import { AdvancedDPVisualizer } from '@/components/visualizers/AdvancedDPVisualizer';
import { AdvancedGraphVisualizer } from '@/components/visualizers/AdvancedGraphVisualizer';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import { BinaryTreeVisualizer } from '@/components/visualizers/BinaryTreeVisualizer';
import { BitManipVisualizer } from '@/components/visualizers/BitManipVisualizer';
import { DisjointSetVisualizer } from '@/components/visualizers/DisjointSetVisualizer';
import { DPVisualizer } from '@/components/visualizers/DPVisualizer';
import { GraphVisualizer } from '@/components/visualizers/GraphVisualizer';
import { GreedyVisualizer } from '@/components/visualizers/GreedyVisualizer';
import { HashTableVisualizer } from '@/components/visualizers/HashTableVisualizer';
import { HeapVisualizer } from '@/components/visualizers/HeapVisualizer';
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer';
import { MathVisualizer } from '@/components/visualizers/MathVisualizer';
import { MatrixVisualizer } from '@/components/visualizers/MatrixVisualizer';
import { QueueVisualizer } from '@/components/visualizers/QueueVisualizer';
import { RecursionVisualizer } from '@/components/visualizers/RecursionVisualizer';
import { SearchingVisualizer } from '@/components/visualizers/SearchingVisualizer';
import { SegmentTreeVisualizer } from '@/components/visualizers/SegmentTreeVisualizer';
import { SortingVisualizer } from '@/components/visualizers/SortingVisualizer';
import { StackVisualizer } from '@/components/visualizers/StackVisualizer';
import { StringAlgoVisualizer } from '@/components/visualizers/StringAlgoVisualizer';
import { StringVisualizer } from '@/components/visualizers/StringVisualizer';
import { TrieVisualizer } from '@/components/visualizers/TrieVisualizer';
import { TwoPointersVisualizer } from '@/components/visualizers/TwoPointersVisualizer';

type VisualizerCase = {
  name: string;
  element: React.ReactElement;
};

const visualizers: VisualizerCase[] = [
  { name: 'AdvancedDPVisualizer', element: <AdvancedDPVisualizer /> },
  { name: 'AdvancedGraphVisualizer', element: <AdvancedGraphVisualizer /> },
  { name: 'ArrayVisualizer', element: <ArrayVisualizer initialArray={[5, 3, 8, 1]} algorithm="bubble-sort" /> },
  { name: 'BinaryTreeVisualizer', element: <BinaryTreeVisualizer /> },
  { name: 'BitManipVisualizer', element: <BitManipVisualizer /> },
  { name: 'DisjointSetVisualizer', element: <DisjointSetVisualizer /> },
  { name: 'DPVisualizer', element: <DPVisualizer /> },
  { name: 'GraphVisualizer', element: <GraphVisualizer /> },
  { name: 'GreedyVisualizer', element: <GreedyVisualizer /> },
  { name: 'HashTableVisualizer', element: <HashTableVisualizer /> },
  { name: 'HeapVisualizer', element: <HeapVisualizer /> },
  { name: 'LinkedListVisualizer', element: <LinkedListVisualizer /> },
  { name: 'MathVisualizer', element: <MathVisualizer /> },
  { name: 'MatrixVisualizer', element: <MatrixVisualizer /> },
  { name: 'QueueVisualizer', element: <QueueVisualizer /> },
  { name: 'RecursionVisualizer', element: <RecursionVisualizer /> },
  { name: 'SearchingVisualizer', element: <SearchingVisualizer /> },
  { name: 'SegmentTreeVisualizer', element: <SegmentTreeVisualizer /> },
  { name: 'SortingVisualizer', element: <SortingVisualizer /> },
  { name: 'StackVisualizer', element: <StackVisualizer /> },
  { name: 'StringAlgoVisualizer', element: <StringAlgoVisualizer /> },
  { name: 'StringVisualizer', element: <StringVisualizer /> },
  { name: 'TrieVisualizer', element: <TrieVisualizer /> },
  { name: 'TwoPointersVisualizer', element: <TwoPointersVisualizer /> },
];

describe('visualizer components', () => {
  it.each(visualizers)('%s renders without crashing', ({ element }) => {
    const { container } = render(element);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.textContent).not.toEqual('');
  });

  it.each(visualizers)('%s exposes interactive controls', ({ element }) => {
    const { container } = render(element);

    expect(container.querySelector('button, input[type="range"], select')).not.toBeNull();
  });
});
