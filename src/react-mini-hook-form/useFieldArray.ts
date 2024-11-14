import { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { ObjectType } from './types.ts';

type Control = (
	fieldName: string,
	isArrayRegistered?: boolean
) => {
	field: { value: string; onChange: (value: string) => void };
	fieldArrayLength: number;
	removeField: (index: number, fieldName: string) => void;
	defaultValue?: ObjectType | string;
};

type UseFieldArray = {
	control: Control;
	name: string;
};

export const useFieldArray = ({ control, name }: UseFieldArray) => {
	const { defaultValue } = control(name, true);

	const [length, setLength] = useState(Object.keys(defaultValue || {}).length ? 1 : 0);

	const fields = useMemo(
		() =>
			Array.from({ length }, () => {
				const id = nanoid();
				return { id };
			}),
		[length]
	);

	const append = useCallback(() => setLength(prevLength => prevLength + 1), []);
	const remove = useCallback(
		(index: number) => {
			control(name, true).removeField(index, name);
			setLength(prevLength => prevLength - 1);
		},
		[control, name]
	);

	return useMemo(() => ({ fields, append, remove }), [append, fields, remove]);
};
