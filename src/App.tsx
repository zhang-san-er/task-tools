import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { TaskPlatform } from './pages/TaskPlatform';
import { TaskRecords } from './pages/TaskRecords';
import { IdeaNotes } from './pages/IdeaNotes';

const App: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/task-platform" element={<TaskPlatform />} />
			<Route path="/task-platform/records" element={<TaskRecords />} />
			<Route path="/idea-notes" element={<IdeaNotes />} />
		</Routes>
	);
};

export default App;
