import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { Errors, FieldValidationOptions, FormState, ValidationRules } from './types.ts';
import { REQUIRED_FIELD_DEFAULT_MESSAGE } from './constants.ts';

export const useForm = () => {
	const formStore = useMemo(() => new FormStore(), []);

	const [watchedFormValue, setWatchedFormValue] = useState<FormState>(formStore.getFormState());
	const [fieldNameList, setFieldNameList] = useState<string[]>([]);
	const [fieldValidationMap, setFieldValidationMap] = useState<Record<string, FieldValidationOptions>>({});
	const [errors, setErrors] = useState<Errors>({});

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
			};
		},
		[fieldValidationMap, formStore]
	);

	const trigger = useCallback(async () => {
		const errors = Object.keys(fieldValidationMap).reduce((acc, cur) => {
			if (fieldValidationMap[cur][ValidationRules.Required] && !formStore.proxy[cur]?.length) {
				acc[cur] = { message: '' };
				acc[cur].message =
					typeof fieldValidationMap[cur][ValidationRules.Required] === 'string'
						? fieldValidationMap[cur][ValidationRules.Required]
						: REQUIRED_FIELD_DEFAULT_MESSAGE;
			}
			if (
				fieldValidationMap[cur][ValidationRules.Min] &&
				formStore.proxy[cur]?.length < fieldValidationMap[cur][ValidationRules.Min]
			) {
				acc[cur] = { message: '' };
				acc[cur].message = `Min length is ${fieldValidationMap[cur][ValidationRules.Min]}`;
			}
			if (
				fieldValidationMap[cur][ValidationRules.Max] &&
				formStore.proxy[cur]?.length > fieldValidationMap[cur][ValidationRules.Max]
			) {
				acc[cur] = { message: '' };
				acc[cur].message = `Max length is ${fieldValidationMap[cur][ValidationRules.Max]}`;
			}
			return acc;
		}, {} as Errors);
		setErrors(errors);
		return errors;
	}, [fieldValidationMap, formStore.proxy]);

	const handleSubmit = useCallback(
		(submitHandler: (arg: FormState) => void) => async (evt: FormEvent) => {
			evt.preventDefault();
			const errors = await trigger();
			if (!Object.keys(errors).length) submitHandler(formStore.getFormState());
		},
		[formStore, trigger]
	);

	return { watch, register, handleSubmit, trigger, formState: { errors } };
};
