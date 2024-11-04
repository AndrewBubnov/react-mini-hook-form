import { FormState, ResetValues, Subscribers } from './types.ts';

export class FormStore {
	subscribers: Subscribers;
	proxy: FormState;

	constructor() {
		this.subscribers = {};
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
		return Object.keys(this.proxy);
	}

	addField(key: string) {
		this.proxy = this.createProxy({ ...this.proxy, [key]: this.proxy[key] || '' });
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