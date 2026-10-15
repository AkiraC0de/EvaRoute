import PageHeader from "../../components/ui/PageHeader";

/**
 * Activity history — placeholder screen from the original app. The API
 * exposes no activity-log endpoint yet, so this stays a stub rather than
 * inventing data.
 */
const HistoryPage = () => (
  <div>
    <PageHeader title="History" subtitle="Activity history is not available yet." />
  </div>
);

export default HistoryPage;
