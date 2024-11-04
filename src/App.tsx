import { useForm } from './react-mini-hook-form/useForm.ts';

function App() {
	const { register, handleSubmit, watch } = useForm();
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
					{...register('title')}
				/>
			</label>
			<label style={{ fontWeight: 600 }}>
				Body
				<input
					type="text"
					name="body"
					placeholder="Update body..."
					style={{ width: '100%', height: 40 }}
					{...register('body')}
				/>
			</label>
			<button type="submit">Submit</button>
		</form>
	);
}

export default App;
