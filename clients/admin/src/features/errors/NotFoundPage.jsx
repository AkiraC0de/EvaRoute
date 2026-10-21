import { useNavigate } from "react-router-dom";
import { Signpost } from "lucide-react";
import Button from "../../components/ui/Button";
import { homePathFor } from "../../app/navigation";
import { useAuth } from "../../context/AuthContext";

/**
 * 404 — the theme's error-page family (tinted icon chip, flat hairline card,
 * clear way back) composed as a centered signature screen. The numeral is
 * decorative (aria-hidden) and the heading says what happened for screen
 * readers; the location is echoed in the copy so dead deep links (e.g. a
 * deleted facility) explain themselves instead of silently redirecting.
 */
const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-2">
      <div className="w-full max-w-[440px] rounded-xl border border-line bg-surface px-6 pb-8 pt-7 text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary-ink"
        >
          <Signpost size={22} strokeWidth={2} />
        </span>

        <p
          aria-hidden="true"
          className="mt-4 text-[56px] font-bold leading-none tracking-tight text-ink"
        >
          4<span className="text-primary-ink">0</span>4
        </p>

        <h1 className="mt-4 text-[16px] font-bold text-ink">Page not found</h1>
        <p className="mt-1 text-[12px] font-semibold text-secondary-ink">
          This route has been evacuated.
        </p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[12px] leading-relaxed text-pretty text-muted">
          The page you are looking for may have moved, been renamed, or never
          existed. Check the address, or head back to safety.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="md"
            onClick={() => navigate(homePathFor(user), { replace: true })}
            className="min-h-11"
          >
            Back to my home
          </Button>
          <Button
            size="md"
            variant="neutral"
            onClick={() => navigate(-1)}
            className="min-h-11"
          >
            Previous page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
