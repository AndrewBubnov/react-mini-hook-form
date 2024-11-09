import { Controller, useForm } from './react-mini-hook-form';
import { Input } from './components/ui/input.tsx';
import { useFieldArray } from './react-mini-hook-form/useFieldArray.ts';
import { Button } from './components/ui/button.tsx';

export const FieldArray = () => {
	const { control } = useForm();

	const { fields, append } = useFieldArray({ control, name: 'test' });
	console.log({ fields });
	return (
		<div>
			<Button onClick={append}>Add form</Button>
			<form className="flex flex-col gap-4 p-5">
				{fields.map(({ id }, index) => (
					<Controller
						key={id}
						className="border border-gray-700 rounded p-1"
						name={`test.${index}`}
						control={control}
						render={({ field }) => <Input {...field} onChange={evt => field.onChange(evt.target.value)} />}
					/>
				))}
			</form>
		</div>
	);
};
