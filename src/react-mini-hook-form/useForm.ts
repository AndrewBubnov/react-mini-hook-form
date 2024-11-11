import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { DefaultValues, FieldValidationOptions, Mode, SubmitHandler, UseFormProps } from './types.ts';
import { useValidation } from './useValidation.ts';
import { useWatch } from './useWatch.ts';

export const useForm = ({ resolver, defaultValues, mode = Mode.Submit }: UseFormProps = {}) => {
	const formStore = useMemo(() => new FormStore(), []);
	const resolverRef = useRef<UseFormProps['resolver']>(resolver);
	const defaultValueRef = useRef<DefaultValues>(defaultValues);

	const [validationMode, setValidationMode] = useState<Mode>(mode);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const fieldsRefMap = useRef<Record<string, HTMLInputElement | null>>({});
	const isSubmitted = useRef<boolean>(false);
	const isValid = useRef<boolean>(false);

	const { watch, control, reset, createWatchList } = useWatch(formStore, fieldsRefMap, defaultValueRef.current);

	const { trigger, errors, validationMapRef, isTriggered, setIsTriggered } = useValidation(
		formStore.data,
		resolverRef.current
	);

	useEffect(() => {
		if (isTriggered && !isSubmitted.current) setValidationMode(Mode.Change);
	}, [isTriggered]);

	useEffect(() => {
		if (validationMode !== Mode.Change) return;
		createWatchList();
		const formErrors = resolverRef.current ? trigger().errors : trigger();
		isValid.current = Boolean(!Object.keys(formErrors || {}).length);
	}, [createWatchList, trigger, validationMode, watch]);

	const register = useCallback(
		(fieldName: string, validationOptions?: FieldValidationOptions) => {
			formStore.registerField({ fieldName, defaultValue: defaultValueRef.current?.[fieldName] });
			if (validationOptions) {
				validationMapRef.current = { ...validationMapRef.current, [fieldName]: validationOptions };
			}
			return {
				onChange: (evt: ChangeEvent<HTMLInputElement>) => formStore.updateField(fieldName, evt.target.value),
				defaultValue: defaultValueRef.current?.[fieldName],
				ref: (element: HTMLInputElement | null) => {
					if (element) fieldsRefMap.current[fieldName] = element;
				},
			};
		},
		[formStore, validationMapRef]
	);

	const onAfterSubmit = useCallback(() => {
		isSubmitted.current = true;
		setIsSubmitting(false);
		setIsTriggered(false);
		setValidationMode(mode);
	}, [mode, setIsTriggered]);

	const handleSubmit = useCallback(
		(submitHandler: SubmitHandler) => async (evt: FormEvent) => {
			evt.preventDefault();
			setIsTriggered(true);
			const currentValues = formStore.getFormState();
			const errors = trigger();
			if (!Object.keys(errors).length) {
				setIsSubmitting(true);
				await submitHandler(currentValues);
				onAfterSubmit();
			}
		},
		[formStore, onAfterSubmit, setIsTriggered, trigger]
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
