export type FormState = Record<string, string>;

export type Subscribers = Record<string, ((arg: string) => void)[]>;

export enum ValidationRules {
	Required = 'required',
	Min = 'min',
	Max = 'max',
}

export type FieldValidationOptions = Partial<{
	[ValidationRules.Required]: boolean | string;
	[ValidationRules.Min]: number;
	[ValidationRules.Max]: number;
}>;

export type Errors = Record<string, Record<'message', string>>;
