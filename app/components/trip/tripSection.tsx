interface SectionProps {
    title: string;
    count?: number;
    action?: React.ReactNode;
    children: React.ReactNode;
}

export function TripSection({ title, count, action, children }: SectionProps) {
    return (
        <div className="shadow-sm border p-3">
            <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fw-semibold text-dark mb-0">
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