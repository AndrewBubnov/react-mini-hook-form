import { useForm } from './react-mini-hook-form/FormState.ts';

function App() {
	const { watch, register } = useForm();
	const title = watch('title');
	console.log(title);

	return (
		<form style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
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
		</form>
	);
}

export default App;
