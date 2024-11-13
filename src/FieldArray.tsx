import { Controller, useForm } from './react-mini-hook-form';
import { Input } from './components/ui/input.tsx';
import { useFieldArray } from './react-mini-hook-form/useFieldArray.ts';
import { Button } from './components/ui/button.tsx';
import { Label } from './components/ui/label.tsx';

export const FieldArray = () => {
	const { control } = useForm({
		defaultValues: {
			test: { firstName: 'Andrew', lastName: 'Bubnov', position: 'frontend developer' },
			test1: 'test1',
		},
	});

	const { fields, append, remove } = useFieldArray({ control, name: 'test' });
	return (
		<div>
			<Button onClick={append}>Add form</Button>
			<form className="flex flex-col gap-4 pt-5">
				{fields.map(({ id }, index) => (
					<div className="flex gap-5 items-end" key={id}>
						<Label className="flex flex-col gap-1">
							<span>First name</span>
							<Controller
								className="border border-gray-700 rounded p-1"
								name={`test.${index}.firstName`}
								control={control}
								render={({ field }) => (
									<Input {...field} onChange={evt => field.onChange(evt.target.value)} />
								)}
							/>
						</Label>
						<Label className="flex flex-col gap-1">
							<span>Second name</span>
							<Controller
								className="border border-gray-700 rounded p-1"
								name={`test.${index}.lastName`}
								control={control}
								render={({ field }) => (
									<Input {...field} onChange={evt => field.onChange(evt.target.value)} />
								)}
							/>
						</Label>
						<Label className="flex flex-col gap-1">
							<span>Position</span>
							<Controller
								className="border border-gray-700 rounded p-1"
								name={`test.${index}.position`}
								control={control}
								render={({ field }) => (
									<Input {...field} onChange={evt => field.onChange(evt.target.value)} />
								)}
							/>
						</Label>
						<Button onClick={() => remove(index)} type="button">
							Delete
						</Button>
					</div>
				))}
			</form>
		</div>
	);
};
