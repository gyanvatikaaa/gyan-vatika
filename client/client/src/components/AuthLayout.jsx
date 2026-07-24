import LeafMark from "./LeafMark";

const AuthLayout = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-vatika-bg">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <LeafMark className="w-9 h-9" />
          <span className="font-display text-xl font-semibold text-vatika-forest">
            Gyan Vatika
          </span>
        </div>

        <div className="bg-vatika-surface border border-vatika-line rounded-card shadow-sm p-8">
          {eyebrow && (
            <p className="text-xs tracking-wide uppercase text-vatika-marigoldDark font-semibold mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-semibold text-vatika-ink mb-1">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-vatika-muted mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
