import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { FieldValidationOptions, FormState, Mode, UseFormProps } from './types.ts';
import { useValidation } from './useValidation.ts';
import { useWatch } from './useWatch.ts';

export const useForm = ({ resolver, mode = Mode.Submit }: UseFormProps = {}) => {
	const formStore = useMemo(() => new FormStore(), []);

	const [isSubmitAttempted, setIsSubmitAttempted] = useState<boolean>(false);
	const [validationMode, setValidationMode] = useState<Mode>(mode);

	const fieldsRefMap = useRef<Record<string, HTMLInputElement | null>>({});
	const isSubmitted = useRef<boolean>(false);
	const isValid = useRef<boolean>(false);

	const { watch, control, reset } = useWatch(formStore, fieldsRefMap);

	const { validate, trigger, errors, validationMapRef } = useValidation(formStore.proxy, resolver);

	useEffect(() => {
		if (isSubmitAttempted && !isSubmitted.current) setValidationMode(Mode.Change);
	}, [isSubmitAttempted]);

	useEffect(() => {
		if (validationMode === Mode.Change) {
			const { errors: formErrors } = validate(watch() as FormState);
			isValid.current = Boolean(!Object.keys(formErrors).length);
		}
	}, [validate, validationMode, watch]);

	const register = useCallback(
		(fieldName: string, validationOptions?: FieldValidationOptions) => {
			formStore.addField(fieldName);
			if (validationOptions) {
				validationMapRef.current = { ...validationMapRef.current, [fieldName]: validationOptions };
			}
			return {
				onChange: (evt: ChangeEvent<HTMLInputElement>) => formStore.updateField(fieldName, evt.target.value),
				ref: (element: HTMLInputElement | null) => {
					if (element) fieldsRefMap.current[fieldName] = element;
				},
			};
		},
		[formStore]
	);

	const onAfterSubmit = useCallback(() => {
		setIsSubmitAttempted(false);
		isSubmitted.current = true;
	}, []);

	const handleSubmit = useCallback(
		(submitHandler: (arg: FormState) => void) => async (evt: FormEvent) => {
			evt.preventDefault();
			setIsSubmitAttempted(true);
			const currentValues = formStore.getFormState();
			if (resolver) {
				const { values, errors } = validate(currentValues);
				if (!Object.keys(errors).length) {
					submitHandler(values);
					onAfterSubmit();
				}
				return;
			}
			const errors = await trigger();
			if (!Object.keys(errors).length) {
				submitHandler(currentValues);
				onAfterSubmit();
			}
		},
		[formStore, onAfterSubmit, resolver, trigger, validate]
	);

	return useMemo(
		() => ({
			watch,
			register,
			handleSubmit,
			trigger,
			reset,
			control,
			formState: { errors, isSubmitted: isSubmitted.current, isValid: isValid.current },
		}),
		[control, errors, handleSubmit, register, reset, trigger, watch]
	);
};
