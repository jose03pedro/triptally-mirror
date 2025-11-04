"use client";

type FieldErrorsProps = {
    errors?: string[];          // array of errors for the field
    asList?: boolean;           // render as <ul> or multiple <div>
    className?: string;         // optional extra classes
};

export default function FieldErrors({ errors, asList = false, className = "" }: FieldErrorsProps) {
    if (!errors || errors.length === 0) return null;

    if (asList) {
        return (
            <div className={`invalid-feedback ${className}`}>
                <ul className="mb-0 px-0">
                    {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <>
            {errors.map((err, i) => (
                <div key={i} className={`invalid-feedback ${className}`}>
                    {err}
                </div>
            ))}
        </>
    );
}
