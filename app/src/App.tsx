import { AppShell } from "@/AppShell";
import { ConversationProvider } from "@/components/palette/chat";
import { StoreProvider } from "@/domain/store";

export function App() {
  return (
    <StoreProvider>
      <ConversationProvider>
        <AppShell />
      </ConversationProvider>
    </StoreProvider>
  );
}
