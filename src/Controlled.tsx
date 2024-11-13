import { Controller, useForm, zodResolver } from './react-mini-hook-form';
import { controlledForm } from './form.ts';
import { FormState } from './react-mini-hook-form/types.ts';
import { Button } from './components/ui/button.tsx';
import { Input } from './components/ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select.tsx';
import { Label } from './components/ui/label.tsx';

export const Controlled = () => {
	const hook = useForm({ resolver: zodResolver(controlledForm), defaultValues: { input: 'input' } });
	const {
		control,
		handleSubmit,
		watch,
		trigger,
		formState: { errors },
	} = hook;
	const submitHandler = async (data: FormState) => console.log(data);

	console.log(watch());

	return (
		<form className="flex flex-col gap-4 p-5" onSubmit={handleSubmit(submitHandler)}>
			<Label className="flex flex-col gap-1">
				<p>Input</p>
				<Controller
					className="border border-gray-700 rounded p-1"
					name="input"
					control={control}
					render={({ field }) => <Input {...field} onChange={evt => field.onChange(evt.target.value)} />}
				/>
			</Label>
			{errors.input && (
				<span role="alert" className="text-red-500">
					{errors.input?.message}
				</span>
			)}
			<Controller
				className="border border-gray-700 rounded p-1"
				name="select"
				control={control}
				render={({ field }) => (
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<SelectTrigger>
							<SelectValue placeholder="Select a verified email to display" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="m@example.com">m@example.com</SelectItem>
							<SelectItem value="m@google.com">m@google.com</SelectItem>
							<SelectItem value="m@support.com">m@support.com</SelectItem>
						</SelectContent>
					</Select>
				)}
			/>

			<Button type="button" onClick={trigger}>
				Trigger
			</Button>
			<Button type="submit">Submit</Button>
		</form>
	);
};
