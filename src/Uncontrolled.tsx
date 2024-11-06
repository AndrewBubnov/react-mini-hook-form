import { useForm } from './react-mini-hook-form';
import { FormState } from './react-mini-hook-form/types.ts';

export const Uncontrolled = () => {
	const {
		register,
		handleSubmit,
		reset,
		// watch,
		formState: { errors },
	} = useForm();

	// console.log(watch());

	const submitHandler = async (data: FormState) => console.log(data);

	return (
		<form
			style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}
			onSubmit={handleSubmit(submitHandler)}
		>
			<label style={{ fontWeight: 600 }}>
				<p>Title</p>
				<input
					type="text"
					name="title"
					placeholder="Update title..."
					style={{ height: 40 }}
					{...register('title', { required: true, min: 3 })}
				/>
				{errors.title && (
					<p role="alert" style={{ color: 'red' }}>
						{errors.title?.message}
					</p>
				)}
			</label>
			<label style={{ fontWeight: 600 }}>
				<p>Body</p>
				<input
					type="text"
					name="body"
					placeholder="Update body..."
					style={{ height: 40 }}
					{...register('body', { required: 'Body is required', max: 5 })}
				/>
				{errors.body && (
					<p role="alert" style={{ color: 'red' }}>
						{errors.body?.message}
					</p>
				)}
			</label>
			<button type="button" onClick={() => reset({ title: 'title', body: 'Body' })}>
				Reset
			</button>
			<button type="submit">Submit</button>
		</form>
	);
};
