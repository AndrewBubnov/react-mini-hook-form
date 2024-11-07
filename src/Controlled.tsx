import { Controller, useForm, zodResolver } from './react-mini-hook-form';
import { controlledForm } from './form.ts';
import { Input } from './Input.tsx';
import { FormState } from './react-mini-hook-form/types.ts';

export const Controlled = () => {
	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({ resolver: zodResolver(controlledForm), defaultValues: { input: 'input' } });

	const submitHandler = async (data: FormState) => console.log(data);

	console.log(watch());
	return (
		<form
			style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}
			onSubmit={handleSubmit(submitHandler)}
		>
			<label style={{ fontWeight: 600 }}>
				<p>Input</p>
				<Controller name="input" control={control} render={({ field }) => <Input {...field} />} />
			</label>
			{errors.input && (
				<p role="alert" style={{ color: 'red' }}>
					{errors.input?.message}
				</p>
			)}
			<button type="submit">Submit</button>
		</form>
	);
};
