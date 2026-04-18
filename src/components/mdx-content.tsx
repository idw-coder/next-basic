import * as runtime from "react/jsx-runtime";
import MermaidDiagram from "@/components/MermaidDiagram";

const sharedComponents = {
  MermaidDiagram,
};

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MDXContentProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return <Component components={{ ...sharedComponents, ...components }} />;
}
