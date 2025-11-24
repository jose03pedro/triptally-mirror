interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="rounded-4 p-4 mb-4 shadow-sm bg-light border fade-up">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1">{title}</h2>
          {subtitle && <div className="text-muted">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
