import { useForm } from './react-mini-hook-form';
import { FormState } from './react-mini-hook-form/types.ts';
import { Button } from './components/ui/button.tsx';

export const Uncontrolled = () => {
	const {
		register,
		handleSubmit,
		reset,
		watch,
		trigger,
		formState: { errors },
	} = useForm({
		defaultValues: {
			title: 'title',
			// body: 'body',
		},
	});

	console.log(watch('title'));

	const submitHandler = async (data: FormState) => console.log(data);

	return (
		<form className="flex flex-col gap-4 p-5" onSubmit={handleSubmit(submitHandler)}>
			<label className="font-semibold">
				<p>Title</p>
				<input
					className="border border-gray-700 rounded p-1 h-10"
					type="text"
					name="title"
					placeholder="Update title..."
					{...register('title', { required: true, min: 3 })}
				/>
				{errors.title && (
					<p role="alert" className="text-red-500">
						{errors.title?.message}
					</p>
				)}
			</label>
			<label className="font-semibold">
				<p>Body</p>
				<input
					className="border border-gray-700 rounded p-1 h-10"
					type="text"
					name="body"
					placeholder="Update body..."
					{...register('body', { required: 'Body is required', max: 5 })}
				/>
				{errors.body && (
					<p role="alert" className="text-red-500">
						{errors.body?.message}
					</p>
				)}
			</label>
			<Button type="button" onClick={() => reset({ title: 'title', body: 'Body' })}>
				Reset
			</Button>
			<Button type="button" onClick={trigger}>
				Trigger
			</Button>
			<Button type="submit">Submit</Button>
		</form>
	);
};
