import { Label } from "./form";
import { Input, Select, Textarea } from "./input";

export function Field({
  label,
  name,
  required,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      {type === "textarea" ? (
        <Textarea id={name} name={name} required={required} {...props} />
      ) : (
        <Input id={name} name={name} type={type} required={required} {...props} />
      )}
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Select id={name} name={name} required={required}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
