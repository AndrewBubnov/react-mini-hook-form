import { useCallback, useRef, useState } from 'react';
import { Errors, FieldValidationOptions, FormState, UseFormProps, ValidationRules } from './types.ts';
import { REQUIRED_FIELD_DEFAULT_MESSAGE } from './constants.ts';

export const useValidation = (state: FormState, resolver: UseFormProps['resolver']) => {
	const [errors, setErrors] = useState<Errors>({});

	const resolverRef = useRef<UseFormProps['resolver']>(resolver);
	const validationMapRef = useRef<Record<string, FieldValidationOptions>>({});

	const validate = useCallback((values: Record<string, string>) => {
		if (!resolverRef.current) return { values, errors: {} };
		const result = resolverRef.current(values);
		if (result.errors) setErrors(result.errors);
		return result;
	}, []);

	const trigger = useCallback(async () => {
		const errors = Object.keys(validationMapRef.current).reduce((acc, cur) => {
			if (validationMapRef.current[cur][ValidationRules.Required] && !state[cur]?.length) {
				acc[cur] = { message: '' };
				acc[cur].message =
					typeof validationMapRef.current[cur][ValidationRules.Required] === 'string'
						? validationMapRef.current[cur][ValidationRules.Required]
						: REQUIRED_FIELD_DEFAULT_MESSAGE;
			}
			if (
				validationMapRef.current[cur][ValidationRules.Min] &&
				state[cur]?.length < validationMapRef.current[cur][ValidationRules.Min]
			) {
				acc[cur] = { message: '' };
				acc[cur].message = `Min length is ${validationMapRef.current[cur][ValidationRules.Min]}`;
			}
			if (
				validationMapRef.current[cur][ValidationRules.Max] &&
				state[cur]?.length > validationMapRef.current[cur][ValidationRules.Max]
			) {
				acc[cur] = { message: '' };
				acc[cur].message = `Max length is ${validationMapRef.current[cur][ValidationRules.Max]}`;
			}
			return acc;
		}, {} as Errors);
		setErrors(errors);
		return errors;
	}, [validationMapRef.current, state]);

	return { trigger, errors, validationMapRef, validate };
};
