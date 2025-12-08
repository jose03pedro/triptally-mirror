export const ChipSelector = ({
  label,
  options,
  selectedValues,
  onChange,
  name,
}: {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (name: string, value: string) => void;
  name: string;
}) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <div className="d-flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => onChange(name, option)}
            aria-pressed={isSelected}
            style={{ flexGrow: 0 }} // Prevent stretching
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);