import { FormState, RegisterField, ResetValues, Subscribers } from './types.ts';

export class FormStore {
	subscribers: Subscribers;
	base: FormState;
	proxy: FormState;

	constructor() {
		this.subscribers = {};
		this.base = {};
		this.proxy = this.createProxy(this.base);
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
		return Object.assign({}, this.proxy);
	}

	getFields() {
		return Object.keys(this.base);
	}

	registerField({ fieldName, defaultValue }: RegisterField) {
		console.log({ fieldName });
		if (fieldName in this.base) return;
		this.base[fieldName] = '';
		if (defaultValue) this.updateField(fieldName, defaultValue);
	}

	getFieldsArrayLength(fieldName: string) {
		return Object.keys(this.proxy).filter(el => el.split('.')[0] === fieldName.split('.')[0]).length;
	}

	updateField = (fieldName: string, fieldValue: string) => {
		this.proxy[fieldName] = fieldValue;
	};

	reset(resetValues: ResetValues) {
		const resetKeys = resetValues ? Object.keys(resetValues) : this.getFields();
		this.proxy = this.createProxy(
			resetKeys.reduce((acc, cur) => {
				acc[cur] = resetValues?.[cur] || '';
				return acc;
			}, {} as FormState)
		);
	}
}
