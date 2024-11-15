export type ObjectType = Record<string, string>;

export type FormState = ObjectType;

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

export type ResetValues = ObjectType | undefined;

export type DefaultValues = Record<string, string | ObjectType> | undefined;

export type UseFormProps = Partial<{
	resolver: (values: FormState) => { values: FormState; errors: Errors };
	defaultValues: DefaultValues;
	mode: Mode;
}>;

export type SubmitHandler = (arg: FormState) => Promise<void>;
