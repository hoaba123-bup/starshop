import RouterSetup from "./RouterSetup";
import "./index.css";
import { AppMessageProvider } from "./components/ui/AppMessageProvider";
import SessionWatcher from "./components/SessionWatcher";

export default function App() {
  return (
    <AppMessageProvider>
      <SessionWatcher />
      <RouterSetup />
    </AppMessageProvider>
  );
}
