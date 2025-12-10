import './App.css'
import AppRouter from './router/AppRouter';
import ErrorToast from './components/ErrorToast';

function App() {
  return (
    <>
      <ErrorToast />
      <AppRouter />
    </>
  );
}

export default App
