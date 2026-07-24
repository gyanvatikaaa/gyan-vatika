import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }) =>
  `text-sm px-3 py-1.5 rounded-lg border transition ${
    isActive
      ? "bg-vatika-forest text-white border-vatika-forest"
      : "bg-white text-vatika-muted border-vatika-line hover:bg-vatika-bg"
  }`;

const AdminNav = () => (
  <div className="flex gap-2 mb-6">
    <NavLink to="/admin" end className={tabClass}>
      Overview
    </NavLink>
    <NavLink to="/admin/users" className={tabClass}>
      User approvals
    </NavLink>
    <NavLink to="/admin/tests" className={tabClass}>
      Tests
    </NavLink>
    <NavLink to="/admin/review" className={tabClass}>
      Review
    </NavLink>
    <NavLink to="/admin/linking" className={tabClass}>
      Linking
    </NavLink>
    <NavLink to="/admin/fees" className={tabClass}>
      Fees
    </NavLink>
  </div>
);

export default AdminNav;
