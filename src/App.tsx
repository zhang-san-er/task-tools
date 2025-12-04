import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { TaskPlatform } from './pages/TaskPlatform';

const App: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/task-platform" element={<TaskPlatform />} />
		</Routes>
	);
};

export default App;
