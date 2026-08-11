interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  if (!content) return null;

  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {content}
    </div>
  );
}
