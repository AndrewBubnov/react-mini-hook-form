import { useForm } from './react-mini-hook-form/useForm.ts';

function App() {
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
				Title
				<input
					type="text"
					name="title"
					placeholder="Update title..."
					style={{ width: '100%', height: 40 }}
					{...register('title', { required: true, min: 3 })}
				/>
				{errors.title && (
					<p role="alert" style={{ color: 'red' }}>
						{errors.title?.message}
					</p>
				)}
			</label>
			<label style={{ fontWeight: 600 }}>
				Body
				<input
					type="text"
					name="body"
					placeholder="Update body..."
					style={{ width: '100%', height: 40 }}
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
}

export default App;
