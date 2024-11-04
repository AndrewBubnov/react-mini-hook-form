import { useCallback, useState } from 'react';
import { Errors, FieldValidationOptions, FormState, ValidationRules } from './types.ts';
import { REQUIRED_FIELD_DEFAULT_MESSAGE } from './constants.ts';

export const useValidation = (state: FormState) => {
	const [errors, setErrors] = useState<Errors>({});
	const [fieldValidationMap, setFieldValidationMap] = useState<Record<string, FieldValidationOptions>>({});

	const trigger = useCallback(async () => {
		const errors = Object.keys(fieldValidationMap).reduce((acc, cur) => {
			if (fieldValidationMap[cur][ValidationRules.Required] && !state[cur]?.length) {
				acc[cur] = { message: '' };
				acc[cur].message =
					typeof fieldValidationMap[cur][ValidationRules.Required] === 'string'
						? fieldValidationMap[cur][ValidationRules.Required]
						: REQUIRED_FIELD_DEFAULT_MESSAGE;
			}
			if (
				fieldValidationMap[cur][ValidationRules.Min] &&
				state[cur]?.length < fieldValidationMap[cur][ValidationRules.Min]
			) {
				acc[cur] = { message: '' };
				acc[cur].message = `Min length is ${fieldValidationMap[cur][ValidationRules.Min]}`;
			}
			if (
				fieldValidationMap[cur][ValidationRules.Max] &&
				state[cur]?.length > fieldValidationMap[cur][ValidationRules.Max]
			) {
				acc[cur] = { message: '' };
				acc[cur].message = `Max length is ${fieldValidationMap[cur][ValidationRules.Max]}`;
			}
			return acc;
		}, {} as Errors);
		setErrors(errors);
		return errors;
	}, [fieldValidationMap, state]);

	return { trigger, errors, setFieldValidationMap, fieldValidationMap };
};
