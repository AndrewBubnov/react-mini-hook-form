import { useForm } from './react-mini-hook-form/useForm.ts';
import { Input } from './Input.tsx';
import { Controller } from './react-mini-hook-form/Controller.tsx';
import { controlledForm } from './form.ts';
import { zodResolver } from './react-mini-hook-form/zodResolver.ts';

const ControlledForm = () => {
	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({ resolver: zodResolver(controlledForm) });

	console.log(watch());

	return (
		<form
			style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}
			onSubmit={handleSubmit(console.log)}
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

const UncontrolledForm = () => {
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm();

	console.log(watch());

	return (
		<form
			style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}
			onSubmit={handleSubmit(console.log)}
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

const App = () => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 100 }}>
		<ControlledForm />
		{/*<UncontrolledForm />*/}
	</div>
);

export default App;
