import { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { ObjectType } from './types.ts';

type Control = (
	fieldName: string,
	isArrayRegistered?: boolean
) => {
	field: { value: string; onChange: (value: string) => void };
	removeField(index: number, fieldName: string): void;
	shiftFields(name: string, index?: number): void;
	defaultValue?: ObjectType | string;
};

type UseFieldArray = {
	control: Control;
	name: string;
};

export const useFieldArray = ({ control, name }: UseFieldArray) => {
	const { defaultValue, removeField, shiftFields } = control(name, true);

	const [fields, setFields] = useState<{ id: string }[]>(
		defaultValue && Object.keys(defaultValue).length ? [{ id: nanoid() }] : []
	);

	const append = useCallback(() => setFields(prevState => [...prevState, { id: nanoid() }]), []);

	const remove = useCallback(
		(index: number) => {
			removeField(index, name);
			setFields(prevState => prevState.filter((_, elIndex) => index !== elIndex));
		},
		[name, removeField]
	);

	const prepend = useCallback(() => {
		setFields(prevState => [{ id: nanoid() }, ...prevState]);
		shiftFields(name);
	}, [name, shiftFields]);

	const insert = useCallback(
		(index: number) => {
			setFields(prevState => [...prevState.slice(0, index + 1), { id: nanoid() }, ...prevState.slice(index + 1)]);
			shiftFields(name, index);
		},
		[name, shiftFields]
	);

	return useMemo(() => ({ fields, append, remove, prepend, insert }), [append, fields, insert, prepend, remove]);
};
