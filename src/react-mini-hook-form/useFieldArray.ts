import { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { ObjectType } from './types.ts';

type Control = (
	fieldName: string,
	isArrayRegistered?: boolean
) => {
	field: { value: string; onChange: (value: string) => void };
	removeField(index: number, fieldName: string): void;
	shiftFields(name: string): void;
	defaultValue?: ObjectType | string;
};

type UseFieldArray = {
	control: Control;
	name: string;
};

export const useFieldArray = ({ control, name }: UseFieldArray) => {
	const { defaultValue, removeField, shiftFields } = control(name, true);

	const defaultLength = defaultValue && Object.keys(defaultValue).length ? 1 : 0;
	const [listLength, setListLength] = useState(defaultLength);

	const fields = useMemo(
		() =>
			Array.from({ length: listLength }, () => {
				const id = nanoid();
				return { id };
			}),
		[listLength]
	);

	const append = useCallback(() => setListLength(prevLength => prevLength + 1), []);
	const remove = useCallback(
		(index: number) => {
			removeField(index, name);
			setListLength(prevLength => prevLength - 1);
		},
		[name, removeField]
	);
	const prepend = useCallback(() => {
		append();
		shiftFields(name);
	}, [append, name, shiftFields]);

	return useMemo(() => ({ fields, append, remove, prepend }), [append, fields, prepend, remove]);
};
