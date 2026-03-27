import { Heart } from "lucide-react";

interface Props {
  color?: string;
}

export default function Divider({ color = "var(--color-tertiary)" }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <div className="h-px w-16" style={{ background: color, opacity: 0.4 }} />
      <Heart size={10} fill={color} stroke="none" style={{ color }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.7 }} />
      <Heart size={10} fill={color} stroke="none" style={{ color }} />
      <div className="h-px w-16" style={{ background: color, opacity: 0.4 }} />
    </div>
  );
}
