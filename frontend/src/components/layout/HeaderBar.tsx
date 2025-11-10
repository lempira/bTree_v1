import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import HeaderStatus from "../HeaderStatus";
import { useActiveAccount } from "../../hooks/useActiveAccount";
import { getUserAccount } from "../../utils/indexdb";
import type { UserAccount } from "../../utils/indexdb";

export default function HeaderBar(): JSX.Element {
  const { activeAddress } = useActiveAccount();
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  useEffect(() => {
    async function loadUserAccount() {
      if (!activeAddress) {
        setUserAccount(null);
        return;
      }

      try {
        const account = await getUserAccount(activeAddress);
        setUserAccount(account || null);
      } catch (err) {
        console.error('Failed to load user account:', err);
      }
    }

    loadUserAccount();
  }, [activeAddress]);

  const dashboardPath = userAccount?.userType === 'experimenter' ? '/dashboard/experimenter' : '/dashboard/subject';

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
            {activeAddress && (
              <li>
                <NavLink
                  to={dashboardPath}
                  className={({ isActive }) =>
                    isActive ? "active font-bold" : ""
                  }
                >
                  Dashboard
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive ? "active font-bold" : ""
                }
              >
                About
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
