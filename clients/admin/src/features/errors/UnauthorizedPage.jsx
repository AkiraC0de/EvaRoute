import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
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
      <div className="max-w-[480px] rounded-[20px] bg-white p-5 shadow-[0_8px_20px_rgba(40,60,100,0.08)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbe4e3] text-[#e64b43]">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </div>
        <h2 className="mt-3 text-[13px] font-bold text-[#34405f]">
          You don't have access to this page
        </h2>
        <p className="mt-2 text-[10px] leading-relaxed text-[#7180a0]">
          {attempted ? (
            <>
              The page <span className="font-semibold text-[#5f7197]">{attempted}</span> is
              not available for your account ({user?.role === "ADMIN" ? "Administrator" : "Facility staff"}).
            </>
          ) : (
            <>This page is not available for your account.</>
          )}
          {" "}If you think this is a mistake, contact an administrator.
        </p>
        <button
          type="button"
          onClick={() => navigate(homePathFor(user), { replace: true })}
          className="mt-4 min-h-9 rounded-xl bg-[#5269ef] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#4058df]"
        >
          Back to my home
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
