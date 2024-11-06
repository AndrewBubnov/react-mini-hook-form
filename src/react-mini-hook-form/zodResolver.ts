import z from 'zod';

export const zodResolver = (schema: z.ZodSchema) => {
	return (values: Record<string, string>) => {
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
