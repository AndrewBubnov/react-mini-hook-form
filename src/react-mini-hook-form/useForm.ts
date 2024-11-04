import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { FormState } from './types.ts';

export const useForm = () => {
	const formStore = useMemo(() => new FormStore(), []);

	const [formValue, setFormValue] = useState<FormState>(formStore.getFormState());
	const [fieldNameList, setFieldNameList] = useState<string[]>([]);

	useEffect(() => {
		const unsubscribeList: (() => void)[] = [];
		fieldNameList.forEach(fieldName => {
			const unsubscribe = formStore.subscribe(fieldName, newValue => {
				setFormValue(prevState => ({ ...prevState, [fieldName]: newValue }));
			});
			unsubscribeList.push(unsubscribe);
		});

		return () => unsubscribeList.forEach(unsubscribe => unsubscribe());
	}, [fieldNameList, formStore]);

	const watch = useCallback(
		(key?: string) => {
			if (key && !fieldNameList.length) {
				setFieldNameList([key]);
			} else if (!fieldNameList.length) {
				setFieldNameList(formStore.getKeys());
			}
			return key ? formValue[key] ?? '' : formValue;
		},
		[fieldNameList.length, formStore, formValue]
	);

	const register = useCallback(
		(fieldName: string) => {
			formStore.addField(fieldName);
			return {
				onChange: (evt: ChangeEvent<HTMLInputElement>) => formStore.updateField(fieldName, evt.target.value),
			};
		},
		[formStore]
	);

	const handleSubmit = useCallback(
		(submitHandler: (arg: FormState) => void) => (evt: FormEvent) => {
			evt.preventDefault();
			submitHandler(formStore.getFormState());
		},
		[formStore]
	);

	return { watch, register, handleSubmit };
};
