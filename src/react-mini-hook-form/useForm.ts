import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { FieldValidationOptions, Mode, SubmitHandler, UseFormProps } from './types.ts';
import { useValidation } from './useValidation.ts';
import { useWatch } from './useWatch.ts';

export const useForm = ({ resolver, defaultValues, mode = Mode.Submit }: UseFormProps = {}) => {
	const defaultValuesRef = useRef(defaultValues);

	const formStore = useMemo(() => new FormStore(defaultValuesRef.current), []);

	const [validationMode, setValidationMode] = useState<Mode>(mode);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

	const resolverRef = useRef<UseFormProps['resolver']>(resolver);
	const fieldsRefMap = useRef<Record<string, HTMLInputElement | null>>({});
	const isValid = useRef<boolean>(false);

	const { watch, control, reset, createWatchList, formValue } = useWatch(formStore, fieldsRefMap);

	const { trigger, errors, validationMapRef, isTriggered } = useValidation(
		formStore.data,
		resolverRef.current,
		isSubmitted
	);

	useEffect(() => {
		if (isTriggered && !isSubmitted) setValidationMode(Mode.Change);
	}, [isSubmitted, isTriggered]);

	useEffect(() => {
		if (validationMode === Mode.Change) {
			createWatchList();
			const formErrors = trigger();
			isValid.current = Boolean(!Object.keys(formErrors || {}).length);
		}
	}, [formValue, createWatchList, validationMode, trigger]);

	const register = useCallback(
		(fieldName: string, validationOptions?: FieldValidationOptions) => {
			formStore.registerField(fieldName);
			if (validationOptions) {
				validationMapRef.current = { ...validationMapRef.current, [fieldName]: validationOptions };
			}
			return {
				onChange: (evt: ChangeEvent<HTMLInputElement>) => formStore.updateField(fieldName, evt.target.value),
				defaultValue: defaultValuesRef.current?.[fieldName],
				ref: (element: HTMLInputElement | null) => {
					if (element) fieldsRefMap.current[fieldName] = element;
				},
			};
		},
		[formStore, validationMapRef]
	);

	const onAfterSubmit = useCallback(() => {
		setIsSubmitted(true);
		setIsSubmitting(false);
		setValidationMode(mode);
	}, [mode]);

	const handleSubmit = useCallback(
		(submitHandler: SubmitHandler) => async (evt: FormEvent) => {
			evt.preventDefault();
			const currentValues = formStore.getFormState();
			const errors = trigger();
			if (!Object.keys(errors).length) {
				setIsSubmitting(true);
				await submitHandler(currentValues);
				onAfterSubmit();
			}
		},
		[formStore, onAfterSubmit, trigger]
	);

	return useMemo(
		() => ({
			watch,
			register,
			handleSubmit,
			trigger,
			reset,
			control,
			formState: { errors, isSubmitted, isValid: isValid.current, isSubmitting },
		}),
		[control, errors, handleSubmit, isSubmitted, isSubmitting, register, reset, trigger, watch]
	);
};
