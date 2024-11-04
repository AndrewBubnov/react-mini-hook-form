import { useCallback, useEffect, useRef, useState } from 'react';
import { FormState } from './types.ts';
import { FormStore } from './FormStore.ts';

export const useWatch = (formStore: FormStore) => {
	const [watchedFormValue, setWatchedFormValue] = useState<FormState>(formStore.getFormState());

	const fieldNameListRef = useRef<string[]>([]);

	useEffect(() => {
		const unsubscribeList: (() => void)[] = [];
		fieldNameListRef.current.forEach(fieldName => {
			const unsubscribe = formStore.subscribe(fieldName, newValue => {
				setWatchedFormValue(prevState => ({ ...prevState, [fieldName]: newValue }));
			});
			unsubscribeList.push(unsubscribe);
		});

		return () => unsubscribeList.forEach(unsubscribe => unsubscribe());
	}, [formStore]);

	const watch = useCallback(
		(key?: string) => {
			const updatedSet = new Set(fieldNameListRef.current);
			if (key) {
				updatedSet.add(key);
			} else {
				formStore.getKeys().forEach(field => updatedSet.add(field));
			}
			fieldNameListRef.current = Array.from(updatedSet);

			return key ? watchedFormValue[key] ?? '' : watchedFormValue;
		},
		[formStore, watchedFormValue]
	);

	return { watch, setWatchedFormValue };
};
