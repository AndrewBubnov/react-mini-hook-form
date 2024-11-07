import { Uncontrolled } from './Uncontrolled.tsx';
import { Controlled } from './Controlled.tsx';

const App = () => (
	<div className="flex flex-col gap-[100px]">
		<Controlled />
		<Uncontrolled />
	</div>
);

export default App;
