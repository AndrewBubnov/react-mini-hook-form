import { ChangeEvent, FormEvent, useCallback, useMemo, useRef } from 'react';
import { FormStore } from './FormStore.ts';
import { FieldValidationOptions, FormState, ResetValues, UseFormProps } from './types.ts';
import { useValidation } from './useValidation.ts';
import { useWatch } from './useWatch.ts';

export const useForm = ({ resolver }: UseFormProps = {}) => {
	const formStore = useMemo(() => new FormStore(), []);

	const fieldsRefMap = useRef<Record<string, HTMLInputElement | null>>({});

	const { watch, setWatchedFormValue } = useWatch(formStore);

	const { validate, trigger, errors, setFieldValidationMap, fieldValidationMap } = useValidation(
		formStore.proxy,
		resolver
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

	const control = useCallback(
		(fieldName: string) => {
			formStore.addField(fieldName);
			return {
				field: {
					value: formStore.proxy[fieldName] || '',
					onChange: (evt: ChangeEvent<HTMLInputElement>) =>
						formStore.updateField(fieldName, evt.target.value),
				},
			};
		},
		[formStore]
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
		[formStore, setWatchedFormValue]
	);

	const handleSubmit = useCallback(
		(submitHandler: (arg: FormState) => void) => async (evt: FormEvent) => {
			evt.preventDefault();
			const currentValues = formStore.getFormState();
			if (resolver) {
				const { values, errors } = validate(currentValues);
				if (!Object.keys(errors).length) submitHandler(values);
				return;
			}
			const errors = await trigger();
			if (!Object.keys(errors).length) submitHandler(currentValues);
		},
		[formStore, resolver, trigger, validate]
	);

	return useMemo(
		() => ({ watch, register, handleSubmit, trigger, reset, control, formState: { errors } }),
		[control, errors, handleSubmit, register, reset, trigger, watch]
	);
};
