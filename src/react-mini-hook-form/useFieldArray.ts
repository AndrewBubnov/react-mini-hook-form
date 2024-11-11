import { useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';

type UseFieldArray = {
	control: (
		fieldName: string,
		isArrayRegistered?: boolean
	) => {
		field: { value: string; onChange: (value: string) => void };
		fieldArrayLength: number;
		removeField: (fieldName: string, index: number) => void;
	};
	name: string;
};

export const useFieldArray = ({ control, name }: UseFieldArray) => {
	const length = control(name, true).fieldArrayLength;

	const fields = useMemo(
		() =>
			Array.from({ length }, () => {
				const id = nanoid();
				return { id };
			}),
		[length]
	);

	const append = useCallback(() => control(`${name}.${length}`).field.onChange(''), [control, length, name]);
	const remove = useCallback(
		(fieldName: string, index: number) => control(fieldName).removeField(fieldName, index),
		[control]
	);

	return useMemo(() => ({ fields, append, remove }), [append, fields, remove]);
};
