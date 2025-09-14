// components/DateField.tsx
"use client";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Props = {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  calendarPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  portal?: boolean;
  className?: string;
};

export default function DateField({
  label,
  value,
  onChange,
  placeholder = "مثلاً 1404/02/15",
  calendarPosition = "bottom-right",
  portal = true,
  className = "",
}: Props) {
  return (
    <label className={`block md:col-span-1 relative ${className}`}>
      {label && <div className="mb-1 text-sm text-gray-600">{label}</div>}
      <DatePicker
        value={value || ""}
        onChange={(d: any) => onChange?.(d?.format?.("YYYY/MM/DD") || "")}
        calendar={persian}
        locale={persian_fa}
        inputClass="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
        calendarPosition={calendarPosition}
        portal={portal}
        style={{ width: "100%", zIndex: 2000 }}
        containerClassName="w-full"
        placeholder={placeholder}
      />
    </label>
  );
}
