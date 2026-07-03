import * as runtime from 'react/jsx-runtime';
import { ExternalLink } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';
import Figure from '@/app/books/_components/Figure';
import Callout from '@/app/books/_components/Callout';
import SpeechBubble from '@/app/books/_components/SpeechBubble';
import Marker from '@/app/books/_components/Marker';
import TailwindPreview from '@/app/books/_components/TailwindPreview';
import QuizLink from '@/app/books/_components/QuizLink';

// MDX 内で <MermaidDiagram /> と記述するだけで自動的にこのコンポーネントが使われる。
function ResponsiveTable(props: React.ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table {...props} />
    </div>
  );
}

function Anchor(props: React.ComponentPropsWithoutRef<'a'>) {
  const { href, children } = props;
  const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);

  if (!isExternal) {
    return <a {...props} />;
  }

  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink
        aria-hidden="true"
        className="ml-0.5 inline h-3 w-3 align-baseline"
      />
    </a>
  );
}

const sharedComponents = {
  MermaidDiagram,
  Figure,
  Callout,
  SpeechBubble,
  Marker,
  TailwindPreview,
  QuizLink,
  a: Anchor,
  table: ResponsiveTable,
};

// Velite が生成した MDX のコンパイル済みコード文字列を受け取り、
// React コンポーネントとして返すカスタムフック。
// new Function() で文字列を関数化し、jsx-runtime を注入して実行する。
const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MDXContentProps {
  // Velite がビルド時に生成した MDX のコンパイル済み JavaScript 文字列
  code: string;
  // 呼び出し元から追加で渡せるカスタムコンポーネント（ページ固有のものなど）
  components?: Record<string, React.ComponentType>;
}

// MDX コンテンツをレンダリングするコンポーネント
export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return <Component components={{ ...sharedComponents, ...components }} />; // マーメイド図のコンポーネントを追加して上書き
}
