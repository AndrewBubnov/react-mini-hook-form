import { useCallback, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';

type Control = (
	fieldName: string,
	isArrayRegistered?: boolean
) => {
	field: { value: string; onChange: (value: string) => void };
	fieldArrayLength: number;
	removeField: (index: number, fieldName: string) => void;
	defaultValue?: Record<string, string> | string;
};

type UseFieldArray = {
	control: Control;
	name: string;
};

type SetFields = {
	defaultValue: Record<string, string> | string;
	name: string;
	index: number;
	control: Control;
};

const setFields = ({ defaultValue, name, index, control }: SetFields) => {
	if (defaultValue && typeof defaultValue === 'object') {
		Object.keys(defaultValue).forEach(key => {
			control(`${name}.${index}.${key}`).field.onChange(defaultValue[key]);
		});
	} else {
		control(`${name}.${index}`).field.onChange(getDefaultFieldValue(defaultValue));
	}
};

const getDefaultFieldValue = (defaultValue: Record<string, string> | string) => {
	if (!defaultValue || typeof defaultValue === 'string') return defaultValue || '';
	if (typeof defaultValue === 'object') return Object.values(defaultValue)[0];
	return '';
};

export const useFieldArray = ({ control, name }: UseFieldArray) => {
	const { defaultValue = {} } = control(name, true);

	const [length, setLength] = useState(Object.keys(defaultValue).length ? 1 : 0);

	useEffect(() => {
		if (defaultValue) setFields({ defaultValue, name, control, index: 0 });
	}, [control, defaultValue, name]);

	const fields = useMemo(
		() =>
			Array.from({ length }, () => {
				const id = nanoid();
				return { id };
			}),
		[length]
	);

	const append = useCallback(() => {
		setLength(index => {
			setFields({ control, name, index, defaultValue });
			return index + 1;
		});
	}, [control, defaultValue, name]);
	const remove = useCallback((index: number) => control(name, true).removeField(index, name), [control, name]);

	return useMemo(() => ({ fields, append, remove }), [append, fields, remove]);
};
