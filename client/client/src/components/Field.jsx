const Field = ({ label, type = "text", value, onChange, required = false, options, placeholder }) => {
  if (type === "select") {
    return (
      <label className="block mb-4">
        <span className="block text-sm font-medium text-vatika-ink mb-1.5">{label}</span>
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="w-full rounded-lg border border-vatika-line bg-white px-3 py-2.5 text-sm text-vatika-ink focus:border-vatika-forest focus:ring-1 focus:ring-vatika-forest outline-none transition"
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-vatika-ink mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-vatika-line bg-white px-3 py-2.5 text-sm text-vatika-ink placeholder:text-vatika-muted/60 focus:border-vatika-forest focus:ring-1 focus:ring-vatika-forest outline-none transition"
      />
    </label>
  );
};

export default Field;
