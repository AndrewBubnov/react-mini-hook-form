import { DefaultValues, FormState, ObjectType, ResetValues, Subscribers } from './types.ts';
import { normalizeDefaultValues } from './utils.ts';

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

	getFieldsArrayLength(fieldName: string) {
		return new Set(
			Object.keys(this.data)
				.filter(key => fieldName === key.split('.')[0])
				.map(key => key.split('.').at(-1))
		).size;
	}

	updateField = (fieldName: string, fieldValue: string) => {
		this.data[fieldName] = fieldValue;
	};

	removeFormFields(index: number, arrayName: string) {
		const length = this.getFieldsArrayLength(arrayName);

		const fieldsToDelete = Object.keys(this.base).filter(key => {
			const fieldsList = key.split('.');
			const [firstField] = fieldsList;
			const lastField = fieldsList.at(-1);
			return firstField === arrayName && lastField === String(index);
		});

		if (!fieldsToDelete.length) return;

		fieldsToDelete.forEach(field => {
			delete this.base[field];
		});

		const deletedFieldsBaseList = fieldsToDelete.map(el => {
			const fieldsList = el.split('.');
			return fieldsList.slice(0, fieldsList.length - 1).join('.');
		});

		const indexArray = Array.from({ length: length - index - 1 }, (_, localIndex) => index + 1 + localIndex);
		indexArray.forEach(arrayIndex => {
			const fieldsToReplace = Object.keys(this.base).filter(key => {
				const fieldsList = key.split('.');
				const lastField: string = fieldsList.at(-1) || '';
				return (
					deletedFieldsBaseList.includes(fieldsList.slice(0, fieldsList.length - 1).join('.')) &&
					arrayIndex === +lastField
				);
			});
			fieldsToReplace.forEach(field => {
				const currentValue = this.data[field];
				const fieldArray = field.split('.');
				const updatedFieldBase = fieldArray.slice(0, fieldArray.length - 1).join('.');
				this.updateField(`${updatedFieldBase}.${arrayIndex - 1}`, currentValue);
				delete this.base[field];
			});
		});
	}

	shiftFields = (arrayName: string) => {
		const length = this.getFieldsArrayLength(arrayName);

		const prependedFieldsBases = Object.keys(this.base)
			.filter(key => {
				const fieldsList = key.split('.');
				const [firstField] = fieldsList;
				const lastField = fieldsList.at(-1);
				return firstField === arrayName && lastField === '0';
			})
			.map(el => {
				const fieldsList = el.split('.');
				return fieldsList.slice(0, fieldsList.length - 1).join('.');
			});

		const indexArray = Array.from({ length }, (_, index) => index);

		indexArray.forEach(arrayIndex => {
			const fieldsToReplace = Object.keys(this.base).filter(key => {
				const fieldsList = key.split('.');
				const lastField: string = fieldsList.at(-1) || '';
				return (
					prependedFieldsBases.includes(fieldsList.slice(0, fieldsList.length - 1).join('.')) &&
					arrayIndex === +lastField
				);
			});
			fieldsToReplace.forEach(fieldName => {
				const currentValue = this.data[fieldName];
				const fieldArray = fieldName.split('.');
				const updatedFieldBase = fieldArray.slice(0, fieldArray.length - 1).join('.');
				this.updateField(`${updatedFieldBase}.${arrayIndex + 1}`, currentValue);
				this.setDefaultFieldValue(fieldName);
			});
		});
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
