import z from 'zod';
import { ObjectType } from './types.ts';

export const zodResolver = (schema: z.ZodSchema) => {
	return (values: ObjectType) => {
		try {
			const result = schema.parse(values);
			return {
				values: result,
				errors: {},
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors = error.errors.reduce(
					(acc, curr) => {
						const path = curr.path.join('.');
						acc[path] = { message: curr.message };
						return acc;
					},
					{} as Record<string, { message: string }>
				);

				return {
					values,
					errors,
				};
			}
			throw error;
		}
	};
};
