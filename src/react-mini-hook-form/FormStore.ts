import { FormState, RegisterField, ResetValues, Subscribers } from './types.ts';

export class FormStore {
	subscribers: Subscribers;
	base: FormState;
	data: FormState;

	constructor() {
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

	registerField({ fieldName, defaultValue, isArrayRegistered }: RegisterField) {
		if (fieldName in this.base || isArrayRegistered) return;
		this.base[fieldName] = '';
		if (defaultValue) this.updateField(fieldName, defaultValue);
	}

	getFieldsArrayLength(fieldName: string) {
		return Object.keys(this.data).filter(el => el.split('.')[0] === fieldName.split('.')[0]).length;
	}

	updateField = (fieldName: string, fieldValue: string) => {
		this.data[fieldName] = fieldValue;
	};

	removeFieldFromArray(index: number, arrayName: string) {
		const length = this.getFieldsArrayLength(arrayName);
		delete this.base[`${arrayName}.${index}`];

		const indexArray = Array.from({ length: length - index - 1 }, (_, localIndex) => index + 1 + localIndex);
		indexArray.forEach(arrayIndex => {
			const currentValue = this.data[`${arrayName}.${arrayIndex}`];
			this.updateField(`${arrayName}.${arrayIndex - 1}`, currentValue);
			delete this.base[`${arrayName}.${arrayIndex}`];
		});
	}

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
