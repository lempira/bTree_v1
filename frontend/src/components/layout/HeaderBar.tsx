import { NavLink } from "react-router-dom";
import HeaderStatus from "../HeaderStatus";

export default function HeaderBar(): JSX.Element {
  return (
    <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-10 shadow-sm">
      <div className="navbar-start">
        <NavLink to="/" className="btn btn-ghost text-xl font-bold">
          bTree
        </NavLink>
        <nav aria-label="Main" className="hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "active font-bold" : ""
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/subject"
                className={({ isActive }) =>
                  isActive ? "active font-bold" : ""
                }
              >
                Subject
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "active font-bold" : ""
                }
              >
                Admin
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/docs"
                className={({ isActive }) =>
                  isActive ? "active font-bold" : ""
                }
              >
                Docs
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className="navbar-end">
        <HeaderStatus />
      </div>
    </header>
  );
}
