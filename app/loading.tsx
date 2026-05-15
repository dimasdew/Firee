export default function Loading() {
  return (
    <div className="page-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="firee-loader">
        <div className="firee-loader-dot" />
        <div className="firee-loader-dot" style={{ animationDelay: "0.15s" }} />
        <div className="firee-loader-dot" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}
