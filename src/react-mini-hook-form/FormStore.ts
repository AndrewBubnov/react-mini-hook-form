import { FormState, ResetValues, Subscribers } from './types.ts';

export class FormStore {
	subscribers: Subscribers;
	base: FormState;
	proxy: FormState;

	constructor() {
		this.subscribers = {};
		this.base = {};
		this.proxy = this.createProxy({});
	}

	createProxy(base: Record<string, string>) {
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

	getKeys() {
		console.log('line 45 this.base = ', this.base);
		return Object.keys(this.base);
	}

	addField(key: string) {
		if (key in this.base) return;
		this.base[key] = '';
		console.log('line 52 this.base = ', this.base);
	}

	updateField = (fieldName: string, fieldValue: string) => {
		this.proxy[fieldName] = fieldValue;
	};

	reset(resetValues: ResetValues) {
		const resetKeys = resetValues ? Object.keys(resetValues) : this.getKeys();
		this.proxy = this.createProxy(
			resetKeys.reduce((acc, cur) => {
				acc[cur] = resetValues?.[cur] || '';
				return acc;
			}, {} as FormState)
		);
	}
}
