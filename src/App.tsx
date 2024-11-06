import { Uncontrolled } from './Uncontrolled.tsx';
import { Controlled } from './Controlled.tsx';

const App = () => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 100 }}>
		<Controlled />
		<Uncontrolled />
	</div>
);

export default App;
