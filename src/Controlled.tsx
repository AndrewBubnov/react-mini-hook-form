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
		<form className="flex flex-col gap-4 p-5" onSubmit={handleSubmit(submitHandler)}>
			<label className="font-semibold">
				<p>Input</p>
				<Controller
					className="border border-gray-700 rounded p-1"
					name="input"
					control={control}
					render={({ field }) => <Input {...field} />}
				/>
			</label>
			{errors.input && (
				<span role="alert" className="text-red-500">
					{errors.input?.message}
				</span>
			)}
			<button type="submit">Submit</button>
		</form>
	);
};
