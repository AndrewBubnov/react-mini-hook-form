import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormStore } from './FormStore.ts';
import { FieldValidationOptions, FormState, Mode, ResetValues, SubmitHandler, UseFormProps } from './types.ts';
import { useValidation } from './useValidation.ts';
import { useWatchList } from './useWatchList.ts';
import { useLatest } from './useLatest.ts';

const useFormMemo = ({ resolver, defaultValues, mode = Mode.Submit }: UseFormProps = {}) => {
	const formStore = useMemo(() => new FormStore(defaultValues), [defaultValues]);

	const [validationMode, setValidationMode] = useState<Mode>(mode);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
	const [formValue, setFormValue] = useState<FormState>(formStore.defaultValues);

	const fieldsRefMap = useRef<Record<string, HTMLInputElement | null>>({});
	const isValid = useRef<boolean>(false);

	const { trigger, errors, validationMapRef, isTriggered, setIsTriggered } = useValidation(formStore.data, resolver);

	const { watchedNameListRef, createWatchList } = useWatchList(formStore, defaultValues);

	const formValueRef = useLatest(formValue);

	const watchedNameListLength = watchedNameListRef.current.length;

	useEffect(() => {
		if (isTriggered && !isSubmitted) setValidationMode(Mode.Change);
	}, [isSubmitted, isTriggered]);

	useEffect(() => {
		if (validationMode === Mode.Change) createWatchList();
	}, [createWatchList, validationMode]);

	useEffect(() => {
		if (!watchedNameListLength) {
			setFormValue(prevState => ({ ...prevState }));
			return;
		}
		const unsubscribeList: (() => void)[] = [];
		watchedNameListRef.current.forEach(fieldName => {
			const unsubscribe = formStore.subscribe(fieldName, newValue => {
				setFormValue(prevState => ({ ...prevState, [fieldName]: newValue }));
				if (validationMode === Mode.Change) {
					const formErrors = trigger();
					isValid.current = Boolean(!Object.keys(formErrors || {}).length);
				}
			});
			unsubscribeList.push(unsubscribe);
		});

		return () => unsubscribeList.forEach(unsubscribe => unsubscribe());
	}, [formStore, trigger, validationMode, watchedNameListLength, watchedNameListRef]);

	const control = useCallback(
		(fieldName: string, isArrayRegistered?: boolean) => {
			formStore.registerField(fieldName, isArrayRegistered);
			const removeField = (index: number, fieldName: string) => {
				formStore.removeFormFields(index, fieldName);
				setFormValue(prevState =>
					Object.keys(prevState)
						.filter(key => key !== `${fieldName}.${index}`)
						.reduce((acc, cur) => {
							acc[cur] = prevState[cur];
							return acc;
						}, {} as FormState)
				);
			};
			return {
				field: {
					value: formStore.data[fieldName] || '',
					onChange: (value: string) => {
						formStore.updateField(fieldName, value);
						setFormValue(prevState => ({ ...prevState, [fieldName]: value }));
					},
				},
				defaultValue: defaultValues?.[fieldName],
				removeField,
			};
		},
		[defaultValues, formStore]
	);

	const watch = useCallback(
		(key?: string) => {
			createWatchList(key);
			return key ? formValueRef.current[key] ?? '' : formValueRef.current;
		},
		[createWatchList, formValueRef]
	);

	const reset = useCallback(
		(resetValues: ResetValues) => {
			const resetKeys = resetValues ? Object.keys(resetValues) : formStore.getFields();

			resetKeys.forEach(name => {
				const field = fieldsRefMap.current[name];
				if (field) {
					field.value = resetValues?.[name] || '';
				}
			});
			formStore.reset(resetValues);
			setFormValue(formStore.getFormState());
		},
		[fieldsRefMap, formStore]
	);

	const register = useCallback(
		(fieldName: string, validationOptions?: FieldValidationOptions) => {
			formStore.registerField(fieldName);
			if (validationOptions) {
				validationMapRef.current = { ...validationMapRef.current, [fieldName]: validationOptions };
			}
			return {
				onChange: (evt: ChangeEvent<HTMLInputElement>) => formStore.updateField(fieldName, evt.target.value),
				defaultValue: formStore.defaultValues?.[fieldName],
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
		setIsTriggered(false);
		setValidationMode(mode);
	}, [mode, setIsTriggered]);

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

export const useForm = ({ resolver, defaultValues, mode = Mode.Submit }: UseFormProps = {}) => {
	const defaultValuesRef = useRef(defaultValues);

	const resolverRef = useRef<UseFormProps['resolver']>(resolver);
	const modeRef = useRef<UseFormProps['mode']>(mode);

	return useFormMemo({
		resolver: resolverRef.current,
		defaultValues: defaultValuesRef.current,
		mode: modeRef.current,
	});
};
