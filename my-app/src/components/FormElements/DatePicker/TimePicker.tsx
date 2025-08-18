"use client";

import flatpickr from "flatpickr";
import React, { useEffect, useRef } from "react";

interface TimePickerProps {
	name?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ name, value, onChange, disabled }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!inputRef.current) return;
		const fp = flatpickr(inputRef.current, {
			enableTime: true,
			noCalendar: true,
			dateFormat: "H:i",
			defaultDate: value || undefined,
			time_24hr: true,
			minuteIncrement: 5,
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
			<input
				ref={inputRef}
				className="form-timepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
				placeholder="HH:MM"
				data-class="flatpickr-right"
				name={name}
				value={value || ""}
				onChange={onChange}
				readOnly
				disabled={disabled}
			/>
		</div>
	);
};

export default TimePicker; 