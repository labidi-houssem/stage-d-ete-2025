"use client";

import { Calendar } from "../../Layouts/sidebar/icons";
import flatpickr from "flatpickr";
import React, { useEffect, useRef } from "react";

interface DatePickerOneProps {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DatePickerOne: React.FC<DatePickerOneProps> = ({ name, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const fp = flatpickr(inputRef.current, {
      mode: "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: value || undefined,
      onChange: (selectedDates, dateStr) => {
        if (onChange && inputRef.current) {
          const event = {
            ...({} as React.ChangeEvent<HTMLInputElement>),
            target: {
              ...inputRef.current,
              name: name || "",
              value: dateStr,
            },
          };
          onChange(event);
        }
      },
    });
    return () => {
      fp.destroy();
    };
  }, [onChange, name, value]);

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
          placeholder="mm/dd/yyyy"
          data-class="flatpickr-right"
          name={name}
          value={value || ""}
          onChange={onChange}
          readOnly
        />
        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
          <Calendar className="size-3 text-[#9CA3AF]" />
        </div>
      </div>
    </div>
  );
};

export default DatePickerOne;
