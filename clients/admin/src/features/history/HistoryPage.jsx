import EmptyArt from "../../components/ui/EmptyArt";
import PageHeader from "../../components/ui/PageHeader";

/**
 * Activity history — placeholder screen from the original app. The API
 * exposes no activity-log endpoint yet, so this stays a stub rather than
 * inventing data.
 */
const HistoryPage = () => (
  <div>
    <PageHeader title="History" subtitle="Activity history is not available yet." />
    <div className="max-w-[480px] rounded-clay bg-surface p-8 text-center shadow-clay">
      <EmptyArt variant="boxes" className="mx-auto h-20 w-36" />
      <p className="mt-3 text-[13px] font-bold text-ink-soft">Nothing recorded yet</p>
      <p className="mt-1 text-[10px] leading-relaxed text-muted">
        The EvaRoute API does not expose an activity log endpoint yet. When it
        does, check-ins, check-outs and management changes will appear here.
      </p>
    </div>
  </div>
);

export default HistoryPage;
