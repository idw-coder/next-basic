'use client';

import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
  maxWidth?: string;
}

export default function MermaidDiagram({
  chart,
  id,
  maxWidth,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const generatedId = useId();
  const diagramId =
    id ?? `mermaid-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      themeVariables: isDark
        ? {
            primaryColor: '#1e3a5f',
            primaryTextColor: '#e2e8f0',
            primaryBorderColor: '#0967c9',
            lineColor: '#64748b',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
            background: '#0f172a',
            mainBkg: '#1e293b',
            nodeBorder: '#0967c9',
            clusterBkg: '#1e293b',
            clusterBorder: '#334155',
            titleColor: '#e2e8f0',
            edgeLabelBackground: '#1e293b',
          }
        : {
            primaryColor: '#dbeafe',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#0967c9',
            lineColor: '#64748b',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#f8fafc',
            background: '#ffffff',
            mainBkg: '#dbeafe',
            nodeBorder: '#0967c9',
            clusterBkg: '#f0f9ff',
            clusterBorder: '#bfdbfe',
            titleColor: '#1e293b',
            edgeLabelBackground: '#ffffff',
          },
    });

    const render = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(diagramId, chart);
        setSvg(renderedSvg);
      } catch {
        setSvg('');
      }
    };

    render();
  }, [chart, diagramId]);

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-6 w-full overflow-x-auto rounded-md border border-border bg-white p-4 dark:bg-slate-900/50 md:p-6"
      dangerouslySetInnerHTML={{ __html: svg }}
      style={maxWidth ? { maxWidth } : undefined}
    />
  );
}
