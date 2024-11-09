import { Uncontrolled } from './Uncontrolled.tsx';
import { Controlled } from './Controlled.tsx';
import { FieldArray } from './FieldArray.tsx';

const App = () => (
	<div className="flex flex-col gap-[100px] p-4">
		{/*<Controlled />*/}
		{/*<Uncontrolled />*/}
		<FieldArray />
	</div>
);

export default App;
