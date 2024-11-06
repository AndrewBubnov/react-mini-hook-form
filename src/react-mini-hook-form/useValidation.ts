import { useCallback, useRef, useState } from 'react';
import { Errors, FieldValidationOptions, FormState, UseFormProps } from './types.ts';
import { registerValidation } from './utils.ts';

export const useValidation = (state: FormState, resolver: UseFormProps['resolver']) => {
	const [errors, setErrors] = useState<Errors>({});

	const validationMapRef = useRef<Record<string, FieldValidationOptions>>({});

	const validate = useCallback(
		(values: Record<string, string>) => {
			if (!resolver) return { values, errors: {} };
			const result = resolver(values);
			if (result.errors) setErrors(result.errors);
			return result;
		},
		[resolver]
	);

	const trigger = useCallback(() => {
		const errors = Object.keys(validationMapRef.current).reduce(
			registerValidation(validationMapRef.current, state),
			{} as Errors
		);
		setErrors(errors);
		return errors;
	}, [state]);

	return { trigger, errors, validationMapRef, validate };
};
