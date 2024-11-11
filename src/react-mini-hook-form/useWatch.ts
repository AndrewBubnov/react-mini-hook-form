import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DefaultValues, FormState, ResetValues } from './types.ts';
import { FormStore } from './FormStore.ts';

export const useWatch = (
	formStore: FormStore,
	fieldsRefMap: MutableRefObject<Record<string, HTMLInputElement | null>>,
	defaultValues?: DefaultValues
) => {
	const [formValue, setFormValue] = useState<FormState>(defaultValues || {});

	const watchedNameListRef = useRef<string[]>(defaultValues ? Object.keys(defaultValues) : []);

	const watchedNameListLength = watchedNameListRef.current.length;

	useEffect(() => {
		if (!watchedNameListLength) {
			setFormValue(prevState => ({ ...prevState }));
			return;
		}
		const unsubscribeList: (() => void)[] = [];
		watchedNameListRef.current.forEach(fieldName => {
			const unsubscribe = formStore.subscribe(fieldName, newValue => {
				setFormValue(prevState => ({ ...prevState, [fieldName]: newValue }));
			});
			unsubscribeList.push(unsubscribe);
		});

		return () => unsubscribeList.forEach(unsubscribe => unsubscribe());
	}, [formStore, watchedNameListLength]);

	const control = useCallback(
		(fieldName: string, isArrayRegistered?: boolean) => {
			formStore.registerField({ fieldName, defaultValue: defaultValues?.[fieldName], isArrayRegistered });
			const removeField = (index: number, fieldName: string) => {
				formStore.removeFieldFromArray(index, fieldName);
				setFormValue(prevState =>
					Object.keys(prevState)
						.filter(key => key !== fieldName)
						.reduce((acc, cur) => {
							acc[cur] = prevState[cur];
							return acc;
						}, {} as FormState)
				);
			};
			return {
				field: {
					value: formStore.proxy[fieldName] || '',
					onChange: (value: string) => {
						formStore.updateField(fieldName, value);
						setFormValue(prevState => ({ ...prevState, [fieldName]: value }));
					},
				},
				fieldArrayLength: formStore.getFieldsArrayLength(fieldName),
				removeField,
			};
		},
		[defaultValues, formStore]
	);

	const createWatchList = useCallback(
		(key?: string) => {
			const updatedSet = new Set(watchedNameListRef.current);
			if (key) {
				updatedSet.add(key);
			} else {
				formStore.getFields().forEach(field => updatedSet.add(field));
			}
			watchedNameListRef.current = Array.from(updatedSet);
		},
		[formStore]
	);

	const watch = useCallback(
		(key?: string) => {
			createWatchList(key);
			return key ? formValue[key] ?? '' : formValue;
		},
		[createWatchList, formValue]
	);

	const reset = useCallback(
		(resetValues: ResetValues) => {
			const resetKeys = resetValues ? Object.keys(resetValues) : formStore.getFields();

			resetKeys.forEach(name => {
				const field = fieldsRefMap.current[name];
				if (field) {
					field.value = resetValues?.[name] || '';
				}
			});
			formStore.reset(resetValues);
			setFormValue(formStore.getFormState());
		},
		[fieldsRefMap, formStore]
	);

	return useMemo(() => ({ watch, control, reset, createWatchList }), [control, createWatchList, reset, watch]);
};
