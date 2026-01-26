interface SectionProps {
    title: string;
    count?: number;
    action?: React.ReactNode;
    children: React.ReactNode;
}

export function TripSection({ title, count, action, children }: SectionProps) {
    return (
        <div className="card shadow-sm border p-3 mb-4">
            <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fs-5 fs-md-3 fw-semibold text-dark mb-0">
                        {title}
                    </h2>

                    {action && <div>{action}</div>}
                </div>

                {typeof count === "number" && (
                    <span className="small text-muted">{count} item(s)</span>
                )}
            </div>

            <div>
                {children}
            </div>
        </div>
    );
}