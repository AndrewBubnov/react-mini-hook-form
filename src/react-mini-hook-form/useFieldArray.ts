import { useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';

type UseFieldArray = {
	control: (
		fieldName: string,
		isArrayRegistered?: boolean
	) => {
		field: { value: string; onChange: (value: string) => void };
		fieldArrayLength: number;
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
	const append = useCallback(() => control(`${name}.${length}`), [control, length, name]);

	return { fields, append };
};
