import { Controller, useForm } from './react-mini-hook-form';
import { Input } from './components/ui/input.tsx';
import { useFieldArray } from './react-mini-hook-form/useFieldArray.ts';
import { Button } from './components/ui/button.tsx';

export const FieldArray = () => {
	const { control } = useForm();

	const { fields, append, remove } = useFieldArray({ control, name: 'test' });

	return (
		<div>
			<Button onClick={append}>Add form</Button>
			<form className="flex flex-col gap-4 pt-5">
				{fields.map(({ id }, index) => (
					<div className="flex gap-5" key={id}>
						<Controller
							className="border border-gray-700 rounded p-1"
							name={`test.${index}`}
							control={control}
							render={({ field }) => (
								<Input {...field} onChange={evt => field.onChange(evt.target.value)} />
							)}
						/>
						<Button onClick={() => remove(index)} type="button">
							Delete
						</Button>
					</div>
				))}
			</form>
		</div>
	);
};
