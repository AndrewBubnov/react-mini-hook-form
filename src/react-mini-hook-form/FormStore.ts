import { DefaultValues, FormState, ObjectType, ResetValues, Subscribers } from './types.ts';
import { map2DArrayToObject, mapObjectTo2DArrayWithMetadata, normalizeDefaultValues } from './utils.ts';

export class FormStore {
	subscribers: Subscribers;
	base: FormState;
	data: FormState;
	defaultValues: ObjectType;

	constructor(defaultValues?: DefaultValues) {
		this.defaultValues = normalizeDefaultValues(defaultValues);
		this.subscribers = {};
		this.base = {};
		this.data = this.createProxy(this.base);
	}

	createProxy(base: FormState) {
		const handler = {
			set: (target: FormState, property: string, value: string) => {
				target[property] = value;

				if (this.subscribers[property]) {
					this.subscribers[property].forEach(callback => callback(value));
				}

				return true;
			},
			get: (target: FormState, prop: string) => target[prop],
		};

		return new Proxy(base, handler);
	}

	subscribe(key: string, callback: (arg: string) => void) {
		if (!this.subscribers[key]) this.subscribers[key] = [];

		this.subscribers[key].push(callback);
		return () => {
			this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
		};
	}

	getFormState() {
		return Object.assign({}, this.data);
	}

	getFields() {
		return Object.keys(this.base);
	}

	setDefaultFieldValue(fieldName: string) {
		const fieldList = fieldName.split('.');
		const dataFields = fieldList.slice(0, fieldList.length - 1);

		if (!dataFields.length) {
			this.base[fieldName] = this.defaultValues?.[fieldName] || '';
			return;
		}
		this.base[fieldName] = this.defaultValues?.[dataFields.join('.')] || '';
	}

	registerField(fieldName: string, isArrayRegistered?: boolean) {
		if (fieldName in this.base || isArrayRegistered) return;
		this.setDefaultFieldValue(fieldName);
	}

	updateField = (fieldName: string, fieldValue: string) => {
		this.base[fieldName] = fieldValue;
		this.data[fieldName] = fieldValue;
	};

	removeFormFields(index: number, arrayName: string) {
		const { array, baseString, optionalStrings } = mapObjectTo2DArrayWithMetadata(this.base, arrayName);
		this.base = map2DArrayToObject(
			array.filter((_, elIndex) => index !== elIndex),
			baseString,
			optionalStrings
		);
	}

	shiftFields = (arrayName: string, index = 0) => {
		const { array, baseString, optionalStrings } = mapObjectTo2DArrayWithMetadata(this.base, arrayName);
		const additional = Array.from(
			{ length: optionalStrings.length },
			(_, index) => this.defaultValues[`${baseString}.${optionalStrings[index]}`] || ''
		);
		const updatedArray = [...array.slice(0, index + 1), additional, ...array.slice(index + 1)];
		this.base = map2DArrayToObject(updatedArray, baseString, optionalStrings);
	};

	reset(resetValues: ResetValues) {
		const resetKeys = resetValues ? Object.keys(resetValues) : this.getFields();
		this.data = this.createProxy(
			resetKeys.reduce((acc, cur) => {
				acc[cur] = resetValues?.[cur] || '';
				return acc;
			}, {} as FormState)
		);
	}
}
