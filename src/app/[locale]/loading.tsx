export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid var(--rule-color, rgba(255,255,255,0.1))",
          borderTopColor: "var(--red)",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }}
      />
    </div>
  );
}
