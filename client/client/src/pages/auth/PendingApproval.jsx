import { useLocation, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";

const PendingApproval = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <AuthLayout eyebrow="Almost there" title="Your account is pending approval">
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-full bg-vatika-marigold/15 flex items-center justify-center">
          <span className="text-2xl">🌱</span>
        </div>
      </div>

      <p className="text-sm text-vatika-muted text-center leading-relaxed mb-6">
        {email ? (
          <>
            We've received the registration for <strong className="text-vatika-ink">{email}</strong>.
          </>
        ) : (
          "Your account has been created."
        )}{" "}
        An admin needs to review and approve it before you can log in. This is usually quick — we'll let you know once it's done.
      </p>

      <Link
        to="/login"
        className="w-full block text-center rounded-lg border border-vatika-line bg-white text-vatika-ink font-medium py-2.5 text-sm hover:bg-vatika-bg transition"
      >
        Back to login
      </Link>
    </AuthLayout>
  );
};

export default PendingApproval;
