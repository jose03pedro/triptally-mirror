"use client";

type FieldErrorsProps = {
    errors?: string[];          // array of errors for the field
    asList?: boolean;           // render as <ul> or multiple <div>
    className?: string;         // optional extra classes
};

export default function FieldErrors({ errors, asList = false, className = "" }: FieldErrorsProps) {
    if (!errors || errors.length === 0) return null;

    const baseClass = `small text-danger mt-1 ${className}`;

    if (asList) {
        return (
            <div className={baseClass}>
                <ul className="list-disc list-inside">
                    {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className={baseClass}>
            {errors.map((err, i) => (
                <p key={i}>{err}</p>
            ))}
        </div>
    );
}