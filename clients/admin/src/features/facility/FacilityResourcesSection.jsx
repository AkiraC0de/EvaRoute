import StatusPanel from "../../components/ui/StatusPanel";
import ResourceCard from "./ResourceCard";
import ResourceCreateForm from "./ResourceCreateForm";

/** Resources block — header count, create form and the resource card grid. */
const FacilityResourcesSection = ({ resources, createResource, saveResource, removeResource }) => (
  <>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[10px] font-semibold uppercase tracking-[1px] text-muted">
        Resources
      </h2>
      <span className="text-[11px] text-muted">
        {resources.length} recorded
      </span>
    </div>

    <ResourceCreateForm onCreate={createResource} />

    <div className="mt-4">
      {resources.length === 0 ? (
        <StatusPanel tone="empty" title="No resources recorded">
          This facility has no resources yet. Add the first one above.
        </StatusPanel>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onSave={(patch) => saveResource(resource.id, patch)}
              onDelete={() => removeResource(resource.id)}
            />
          ))}
        </section>
      )}
    </div>
  </>
);

export default FacilityResourcesSection;
