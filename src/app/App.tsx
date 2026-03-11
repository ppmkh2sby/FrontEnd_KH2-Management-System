import { AppProviders } from "@/app/providers/AppProviders";
import { HomePage } from "@/pages/home/HomePage";

export function App() {
  return (
    <AppProviders>
      <HomePage />
    </AppProviders>
  );
}
