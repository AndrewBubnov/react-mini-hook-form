import { ReactNode } from 'react';

type Field = {
	value: string;
	onChange(value: string): void;
	className?: string;
};

type ControllerProps = {
	name: string;
	render: (arg: { field: Field }) => ReactNode;
	control(arg: string): { field: Field };
	className?: string;
};

export const Controller = ({ render, name, control, className }: ControllerProps) => {
	const { field } = control(name);
	return render({ field: { ...field, className } });
};
