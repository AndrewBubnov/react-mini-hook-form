import z from 'zod';

export const controlledForm = z.object({
	input: z.string().min(3).max(10),
});
