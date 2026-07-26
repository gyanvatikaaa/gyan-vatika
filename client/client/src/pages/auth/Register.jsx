import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import Field from "../../components/Field";
import { useAuth } from "../../context/AuthContext";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "tutor", label: "Tutor" },
  { value: "admin", label: "Admin" },
];

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    studentClass: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/pending-approval", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Join Gyan Vatika"
      title="Create your account"
      subtitle="Every new account needs admin approval before you can log in."
    >
      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Field label="Full name" value={form.name} onChange={update("name")} required placeholder="Your full name" />
        <Field label="Email" type="email" value={form.email} onChange={update("email")} required placeholder="you@example.com" />
        <Field label="Phone / WhatsApp" value={form.phone} onChange={update("phone")} placeholder="10-digit number" />
        <Field label="Password" type="password" value={form.password} onChange={update("password")} required placeholder="Choose a password" />
        <Field label="I am a" type="select" value={form.role} onChange={update("role")} required options={ROLE_OPTIONS} />
        {form.role === "student" && (
          <Field label="Class" value={form.studentClass} onChange={update("studentClass")} required placeholder="e.g. 10th" />
        )}
        {form.role === "student" && (
          <Field label="Class" value={form.studentClass} onChange={update("studentClass")} required placeholder="e.g. 10th" />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 rounded-lg bg-vatika-forest text-white font-medium py-2.5 text-sm hover:bg-vatika-forestDark transition disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-vatika-muted mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-vatika-forest font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
