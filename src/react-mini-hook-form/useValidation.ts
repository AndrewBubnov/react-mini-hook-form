import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Errors, FieldValidationOptions, FormState, UseFormProps } from './types.ts';
import { registerValidation } from './utils.ts';

export const useValidation = (state: FormState, resolver: UseFormProps['resolver'], isSubmitted: boolean) => {
	const [errors, setErrors] = useState<Errors>({});
	const [isTriggered, setIsTriggered] = useState<boolean>(false);

	const validationMapRef = useRef<Record<string, FieldValidationOptions>>({});

	useEffect(() => {
		if (isSubmitted) setIsTriggered(false);
	}, [isSubmitted]);

	const updateErrors = useCallback((errors: Errors) => {
		setErrors(errors);
		return errors;
	}, []);

	const trigger = useCallback(() => {
		setIsTriggered(true);
		if (resolver) {
			if (!resolver) return {};
			const { errors } = resolver(Object.assign({}, state));
			return updateErrors(errors);
		}
		const errors = Object.keys(validationMapRef.current).reduce(
			registerValidation(validationMapRef.current, state),
			{} as Errors
		);
		return updateErrors(errors);
	}, [resolver, state, updateErrors]);

	return useMemo(
		() => ({ trigger, errors, validationMapRef, isTriggered, setIsTriggered }),
		[errors, isTriggered, trigger]
	);
};
