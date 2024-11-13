export type FormState = Record<string, string>;

export type Subscribers = Record<string, ((arg: string) => void)[]>;

export enum ValidationRules {
	Required = 'required',
	Min = 'min',
	Max = 'max',
}

export enum Mode {
	Submit = 'onSubmit',
	Change = 'onChange',
}

export type FieldValidationOptions = Partial<{
	[ValidationRules.Required]: boolean | string;
	[ValidationRules.Min]: number;
	[ValidationRules.Max]: number;
}>;

export type Errors = Record<string, Record<'message', string>>;

export type ResetValues = Record<string, string> | undefined;

export type DefaultValues = Record<string, string | Record<string, string>> | undefined;

export type UseFormProps = Partial<{
	resolver: (values: FormState) => { values: FormState; errors: Errors };
	defaultValues: DefaultValues;
	mode: Mode;
}>;

export type SubmitHandler = (arg: FormState) => Promise<void>;
