import { DefaultValues, Errors, FieldValidationOptions, FormState, ObjectType, ValidationRules } from './types.ts';
import { REQUIRED_FIELD_DEFAULT_MESSAGE } from './constants.ts';

export const registerValidation =
	(validationMap: Record<string, FieldValidationOptions>, state: FormState) => (acc: Errors, cur: string) => {
		const current = validationMap[cur];
		if (current[ValidationRules.Required] && !state[cur]?.length) {
			acc[cur] = { message: '' };
			acc[cur].message =
				typeof current[ValidationRules.Required] === 'string'
					? current[ValidationRules.Required]
					: REQUIRED_FIELD_DEFAULT_MESSAGE;
		} else if (current[ValidationRules.Min] && state[cur]?.length < current[ValidationRules.Min]) {
			acc[cur] = { message: '' };
			acc[cur].message = `Min length is ${current[ValidationRules.Min]}`;
		} else if (current[ValidationRules.Max] && state[cur]?.length > current[ValidationRules.Max]) {
			acc[cur] = { message: '' };
			acc[cur].message = `Max length is ${current[ValidationRules.Max]}`;
		}
		return acc;
	};

export const normalizeDefaultValues = (defaultValues: DefaultValues): Record<string, string> => {
	if (!defaultValues) return {};

	return Object.entries(defaultValues).reduce((acc, [key, value]) => {
		if (typeof value === 'object' && value !== null) {
			Object.entries(value).forEach(([nestedKey, nestedValue]) => {
				acc[`${key}.${nestedKey}`] = nestedValue;
			});
		} else {
			acc[key] = value as string;
		}
		return acc;
	}, {} as ObjectType);
};
