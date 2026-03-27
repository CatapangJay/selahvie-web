import Divider from "./Divider";

interface Props {
  eyebrow: string;
  title: string;
  light?: boolean;
}

export default function SectionLabel({ eyebrow, title, light = false }: Props) {
  return (
    <div className="text-center mb-12">
      <p
        className="label-luxury mb-3"
        style={{ color: light ? "rgba(255,255,255,0.6)" : "var(--color-tertiary)" }}
      >
        {eyebrow}
      </p>
      <h2
        className="headline-md"
        style={{ color: light ? "#fff" : "var(--color-on-surface)" }}
      >
        {title}
      </h2>
      <Divider color={light ? "rgba(255,255,255,0.5)" : "var(--color-tertiary)"} />
    </div>
  );
}
