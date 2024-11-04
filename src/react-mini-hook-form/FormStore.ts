import { ChangeEvent } from 'react';

export class FormStore {
	subscribers: Record<string, ((arg: string) => void)[]>;
	proxy;

	constructor() {
		this.subscribers = {};
		this.proxy = this.createProxy({});
	}

	createProxy(base: Record<string, string>) {
		const handler = {
			set: (target: Record<string, string>, property: string, value: string) => {
				target[property] = value;

				if (this.subscribers[property]) {
					this.subscribers[property].forEach(callback => callback(value));
				}

				return true;
			},
			get: (target: Record<string, string>, prop: string) => target[prop],
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

	getValue(key?: string) {
		return key ? this.proxy[key] : JSON.parse(JSON.stringify(this.proxy));
	}

	getKeys() {
		return Object.keys(this.proxy);
	}

	addField(key: string) {
		this.proxy = this.createProxy({ ...this.proxy, [key]: this.proxy[key] || '' });
	}

	onChange = (evt: ChangeEvent<HTMLInputElement>, fieldName: string) => {
		this.proxy[fieldName] = evt.target.value;
	};
}
