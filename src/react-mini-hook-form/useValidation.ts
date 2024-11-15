import { useCallback, useMemo, useRef, useState } from 'react';
import { Errors, FieldValidationOptions, FormState, UseForm } from './types.ts';
import { registerValidation } from './utils.ts';

export const useValidation = (state: FormState, resolver: UseForm['resolver']) => {
	const [errors, setErrors] = useState<Errors>({});
	const [isTriggered, setIsTriggered] = useState<boolean>(false);

	const validationMapRef = useRef<Record<string, FieldValidationOptions>>({});

	const updateErrors = useCallback((updatedErrors: Errors) => {
		setErrors(prevState => {
			if (JSON.stringify(prevState) !== JSON.stringify(updatedErrors)) return updatedErrors;
			return prevState;
		});
		return updatedErrors;
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
