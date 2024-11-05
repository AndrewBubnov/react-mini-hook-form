import { ChangeEvent, ReactNode } from 'react';

type Field = {
	value: string;
	onChange: (evt: ChangeEvent<HTMLInputElement>) => void;
};

type ControllerProps = {
	name: string;
	defaultValue?: string;
	render: (arg: { field: Field }) => ReactNode;
	control(arg: string): { field: Field };
};

export const Controller = ({ render, name, control }: ControllerProps) => render(control(name));
