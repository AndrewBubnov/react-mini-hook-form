import { useCallback, useRef } from 'react';
import { FormStore } from './FormStore.ts';
import { DefaultValues } from './types.ts';

export const useWatchList = (formStore: FormStore, defaultValues: DefaultValues) => {
	const watchedNameListRef = useRef<string[]>(defaultValues ? Object.keys(defaultValues) : []);

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

	return { createWatchList, watchedNameListRef };
};
