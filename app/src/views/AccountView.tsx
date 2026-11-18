import { CampaignWidget } from "@/components/widgets/CampaignWidget";
import { useStore } from "@/domain/store";
import { PageHeader } from "./PageHeader";

/** Client-centric primary view (framing A8): every campaign for one brand. */
export function AccountView({ id }: { id: string }) {
  const { world } = useStore();
  const account = world.accounts.find((a) => a.id === id);
  if (!account) return <PageHeader title="Account not found" />;
  const campaigns = world.campaigns.filter((c) => c.accountId === id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={account.name} description={`${account.industry} · ${account.contact}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        {campaigns.map((c) => (
          <CampaignWidget key={c.id} campaign={c} />
        ))}
      </div>
    </div>
  );
}
