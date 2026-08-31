import * as runtime from 'react/jsx-runtime';
import { ExternalLink } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';
import Figure from '@/app/books/_components/Figure';
import Callout from '@/app/books/_components/Callout';
import SpeechBubble from '@/app/books/_components/SpeechBubble';
import Marker from '@/app/books/_components/Marker';
import Pick from '@/app/books/_components/Pick';
import TailwindPreview from '@/app/books/_components/TailwindPreview';
import QuizLink from '@/app/books/_components/QuizLink';
import CodeBlock from '@/app/books/_components/CodeBlock';
import { ScrollHintInitializer } from '@/components/ScrollHintInitializer';

// MDX 内で <MermaidDiagram /> と記述するだけで自動的にこのコンポーネントが使われる。
function ResponsiveTable(props: React.ComponentPropsWithoutRef<'table'>) {
  const { className, ...tableProps } = props;

  return (
    <div className="mdx-table-scroll js-scrollable" tabIndex={0}>
      <table className={className} {...tableProps} />
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
  Pick,
  TailwindPreview,
  QuizLink,
  a: Anchor,
  table: ResponsiveTable,
  pre: CodeBlock,
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
  // MDX 側の props は静的に分からないため any で受ける（MDX の慣例）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
}

// MDX コンテンツをレンダリングするコンポーネント
export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return (
    <>
      <ScrollHintInitializer />
      <Component components={{ ...sharedComponents, ...components }} />
    </>
  ); // マーメイド図のコンポーネントを追加して上書き
}
