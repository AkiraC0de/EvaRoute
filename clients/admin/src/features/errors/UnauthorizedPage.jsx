import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { homePathFor } from "../../app/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * Access-denied page. Reached when a user opens a route their role does not
 * permit (RequireRole in app/guards.jsx). Offers a way back to the first
 * screen they may use instead of a blank content area.
 */
const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const attempted = location.state?.from;

  return (
    <div>
      <PageHeader title="Access denied" />
      <div className="max-w-[480px] rounded-clay bg-surface p-5 shadow-clay">
        <div className="flex h-10 w-10 items-center justify-center rounded-clay-sm bg-danger-soft text-danger shadow-clay-inset">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </div>
        <h2 className="mt-3 text-[13px] font-bold text-ink">
          You don't have access to this page
        </h2>
        <p className="mt-2 text-[10px] leading-relaxed text-muted">
          {attempted ? (
            <>
              The page <span className="font-semibold text-ink-soft">{attempted}</span> is
              not available for your account ({user?.role === "ADMIN" ? "Administrator" : "Facility staff"}).
            </>
          ) : (
            <>This page is not available for your account.</>
          )}
          {" "}If you think this is a mistake, contact an administrator.
        </p>
        <Button
          size="sm"
          onClick={() => navigate(homePathFor(user), { replace: true })}
          className="mt-4"
        >
          Back to my home
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
