interface MarkerProps {
  children: React.ReactNode;
}

export default function Marker({ children }: MarkerProps) {
  return (
    <span className="book-marker">
      {children}
    </span>
  );
}
