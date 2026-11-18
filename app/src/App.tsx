import { AppShell } from "@/AppShell";
import { StoreProvider } from "@/domain/store";

export function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
