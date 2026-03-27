interface Props {
  primary: string;
  weddingDateFormatted: string;
}

export default function SaveTheDateBanner({ primary, weddingDateFormatted }: Props) {
  return (
    <div
      className="text-center"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${primary}99)`,
        padding: "1.25rem 1.5rem",
      }}
    >
      <p
        className="label-luxury"
        style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "0.18em" }}
      >
        {weddingDateFormatted
          ? `Save The Date · ${weddingDateFormatted}`
          : "Save The Date"}
      </p>
    </div>
  );
}
