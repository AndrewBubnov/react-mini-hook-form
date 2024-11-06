import { ChangeEvent, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormState, ResetValues } from './types.ts';
import { FormStore } from './FormStore.ts';

export const useWatch = (
	formStore: FormStore,
	fieldsRefMap: MutableRefObject<Record<string, HTMLInputElement | null>>
) => {
	const [formValue, setFormValue] = useState<FormState>(formStore.getFormState());

	const fieldNameListRef = useRef<string[]>([]);

	const isFormWatched = Boolean(fieldNameListRef.current.length);

	useEffect(() => {
		if (!isFormWatched) {
			setFormValue(prevState => ({ ...prevState }));
			return;
		}
		const unsubscribeList: (() => void)[] = [];
		fieldNameListRef.current.forEach(fieldName => {
			const unsubscribe = formStore.subscribe(fieldName, newValue => {
				setFormValue(prevState => ({ ...prevState, [fieldName]: newValue }));
			});
			unsubscribeList.push(unsubscribe);
		});

		return () => unsubscribeList.forEach(unsubscribe => unsubscribe());
	}, [formStore, isFormWatched]);

	const control = useCallback(
		(fieldName: string) => {
			formStore.addField(fieldName);
			return {
				field: {
					value: formStore.proxy[fieldName] || '',
					onChange: (evt: ChangeEvent<HTMLInputElement>) => {
						formStore.updateField(fieldName, evt.target.value);
						setFormValue(prevState => ({ ...prevState, [fieldName]: evt.target.value }));
					},
				},
			};
		},
		[formStore]
	);

	const watch = useCallback(
		(key?: string) => {
			const updatedSet = new Set(fieldNameListRef.current);
			if (key) {
				updatedSet.add(key);
			} else {
				formStore.getKeys().forEach(field => updatedSet.add(field));
			}
			fieldNameListRef.current = Array.from(updatedSet);

			return key ? formValue[key] ?? '' : formValue;
		},
		[formStore, formValue]
	);

	const reset = useCallback(
		(resetValues: ResetValues) => {
			const resetKeys = resetValues ? Object.keys(resetValues) : formStore.getKeys();

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

	return useMemo(() => ({ watch, control, reset, setFormValue }), [control, reset, watch]);
};
