import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { FieldValidationOptions, FormState, Mode, SubmitHandler, UseFormProps } from './types.ts';
import { useValidation } from './useValidation.ts';
import { useWatch } from './useWatch.ts';

export const useForm = ({ resolver, defaultValues, mode = Mode.Submit }: UseFormProps = {}) => {
	const formStore = useMemo(() => new FormStore(), []);
	const resolverRef = useRef<UseFormProps['resolver']>(resolver);

	const [isSubmitAttempted, setIsSubmitAttempted] = useState<boolean>(false);
	const [validationMode, setValidationMode] = useState<Mode>(mode);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const fieldsRefMap = useRef<Record<string, HTMLInputElement | null>>({});
	const isSubmitted = useRef<boolean>(false);
	const isValid = useRef<boolean>(false);

	const { watch, control, reset, createWatchList } = useWatch(formStore, fieldsRefMap, defaultValues);

	const { validate, trigger, errors, validationMapRef } = useValidation(formStore.proxy, resolverRef.current);

	useEffect(() => {
		if (isSubmitAttempted && !isSubmitted.current) setValidationMode(Mode.Change);
	}, [isSubmitAttempted]);

	useEffect(() => {
		if (validationMode !== Mode.Change) return;
		createWatchList();
		const formErrors = resolverRef.current ? validate(watch() as FormState).errors : trigger();
		isValid.current = Boolean(!Object.keys(formErrors).length);
	}, [createWatchList, trigger, validate, validationMode, watch]);

	const register = useCallback(
		(fieldName: string, validationOptions?: FieldValidationOptions) => {
			formStore.addField(fieldName, defaultValues?.[fieldName]);
			if (validationOptions) {
				validationMapRef.current = { ...validationMapRef.current, [fieldName]: validationOptions };
			}
			return {
				onChange: (evt: ChangeEvent<HTMLInputElement>) => formStore.updateField(fieldName, evt.target.value),
				defaultValue: defaultValues?.[fieldName],
				ref: (element: HTMLInputElement | null) => {
					if (element) fieldsRefMap.current[fieldName] = element;
				},
			};
		},
		[defaultValues, formStore, validationMapRef]
	);

	const onAfterSubmit = useCallback(() => {
		isSubmitted.current = true;
		setIsSubmitting(false);
		setIsSubmitAttempted(false);
		setValidationMode(mode);
	}, [mode]);

	const handleSubmit = useCallback(
		(submitHandler: SubmitHandler) => async (evt: FormEvent) => {
			evt.preventDefault();
			setIsSubmitAttempted(true);
			const currentValues = formStore.getFormState();
			if (resolverRef.current) {
				const { values, errors } = validate(currentValues);
				if (!Object.keys(errors).length) {
					setIsSubmitting(true);
					await submitHandler(values);
					onAfterSubmit();
				}
				return;
			}
			const errors = trigger();
			if (!Object.keys(errors).length) {
				setIsSubmitting(true);
				await submitHandler(currentValues);
				onAfterSubmit();
			}
		},
		[formStore, onAfterSubmit, trigger, validate]
	);

	return useMemo(
		() => ({
			watch,
			register,
			handleSubmit,
			trigger,
			reset,
			control,
			formState: { errors, isSubmitted: isSubmitted.current, isValid: isValid.current, isSubmitting },
		}),
		[control, errors, handleSubmit, isSubmitting, register, reset, trigger, watch]
	);
};
