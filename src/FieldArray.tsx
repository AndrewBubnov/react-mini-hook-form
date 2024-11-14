import { Controller, useForm } from './react-mini-hook-form';
import { Input } from './components/ui/input.tsx';
import { useFieldArray } from './react-mini-hook-form/useFieldArray.ts';
import { Button } from './components/ui/button.tsx';
import { Label } from './components/ui/label.tsx';

export const FieldArray = () => {
	const { control } = useForm({
		defaultValues: {
			test: { firstName: 'Andrew', lastName: 'Bubnov', position: 'frontend developer' },
		},
	});

	const { fields, append, remove, prepend } = useFieldArray({ control, name: 'test' });
	return (
		<div className="flex flex-col gap-5">
			<div className="flex gap-[300px]">
				<Button onClick={append}>Append form</Button>
				<Button onClick={prepend}>Prepend form</Button>
			</div>
			<form className="flex flex-col gap-4 pt-5">
				{fields.map(({ id }, index) => (
					<div className="flex gap-5 items-end" key={id}>
						<Label className="flex flex-col gap-1">
							<span>First name</span>
							<Controller
								className="border border-gray-700 rounded p-1"
								name={`test.firstName.${index}`}
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
								name={`test.lastName.${index}`}
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
								name={`test.position.${index}`}
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
