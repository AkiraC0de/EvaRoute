import StatusPanel from "../../../components/ui/StatusPanel";
import ResourceCard from "../../facility/ResourceCard";
import ResourceCreateForm from "../../facility/ResourceCreateForm";
import DetailSection from "./DetailSection";

/** Resources section — the add-resource trigger in the header, cards below. */
const FacilityResourcesSection = ({ resources, createResource, saveResource, removeResource }) => (
  <DetailSection
    title="Resources"
    action={<ResourceCreateForm onCreate={createResource} />}
  >
    {resources.length === 0 ? (
      <StatusPanel tone="empty" title="No resources recorded">
        This facility has no resources yet. Add the first one from the button above.
      </StatusPanel>
    ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onSave={(patch) => saveResource(resource.id, patch)}
            onDelete={() => removeResource(resource.id)}
          />
        ))}
      </div>
    )}
  </DetailSection>
);

export default FacilityResourcesSection;
