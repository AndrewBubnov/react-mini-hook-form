import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { FieldValidationOptions, FormState, ResetValues } from './types.ts';
import { useValidation } from './useValidation.ts';

export const useForm = () => {
	const formStore = useMemo(() => new FormStore(), []);

	const [watchedFormValue, setWatchedFormValue] = useState<FormState>(formStore.getFormState());
	const [fieldNameList, setFieldNameList] = useState<string[]>([]);

	const fieldsRefMap = useRef<Record<string, HTMLInputElement | null>>({});

	const { trigger, errors, setFieldValidationMap, fieldValidationMap } = useValidation(formStore.proxy);

	useEffect(() => {
		const unsubscribeList: (() => void)[] = [];
		fieldNameList.forEach(fieldName => {
			const unsubscribe = formStore.subscribe(fieldName, newValue => {
				setWatchedFormValue(prevState => ({ ...prevState, [fieldName]: newValue }));
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
			return key ? watchedFormValue[key] ?? '' : watchedFormValue;
		},
		[fieldNameList.length, formStore, watchedFormValue]
	);

	const register = useCallback(
		(fieldName: string, validationOptions?: FieldValidationOptions) => {
			formStore.addField(fieldName);
			if (validationOptions && !(fieldName in fieldValidationMap)) {
				setFieldValidationMap(prevState => ({ ...prevState, [fieldName]: validationOptions }));
			}
			return {
				onChange: (evt: ChangeEvent<HTMLInputElement>) => formStore.updateField(fieldName, evt.target.value),
				ref: (element: HTMLInputElement | null) => {
					if (element) fieldsRefMap.current[fieldName] = element;
				},
			};
		},
		[fieldValidationMap, formStore, setFieldValidationMap]
	);

	const reset = useCallback(
		(resetValues: ResetValues) => {
			const resetKeys = resetValues ? Object.keys(resetValues) : formStore.getKeys();

			resetKeys.forEach(name => {
				const field = fieldsRefMap.current[name];
				if (field) {
					field.value = resetValues?.[name] || '';
				}
			});
			formStore.reset(resetValues);
			setWatchedFormValue(formStore.getFormState());
		},
		[formStore]
	);

	const handleSubmit = useCallback(
		(submitHandler: (arg: FormState) => void) => async (evt: FormEvent) => {
			evt.preventDefault();
			const errors = await trigger();
			if (!Object.keys(errors).length) submitHandler(formStore.getFormState());
		},
		[formStore, trigger]
	);

	return { watch, register, handleSubmit, trigger, reset, formState: { errors } };
};
