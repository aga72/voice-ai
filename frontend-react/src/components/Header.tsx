import { NavLink } from 'react-router-dom';
import logo from '../assets/JDMlogo.png';

function Header() {
  return (
    <header className="bg-white px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <NavLink to="/">
            <img
              src={logo}
              alt="JDM Technology Logo"
              className="h-15 object-contain"
            />
          </NavLink>
        </div>
        <nav className="flex items-center gap-8">
          <NavLink
            to="/searches"
            className={({ isActive }) =>
              isActive
                ? "text-brand-gold font-semibold transition-colors"
                : "text-brand-grey hover:text-brand-gold transition-colors"
            }
          >
            Previous Searches
          </NavLink>
          <NavLink
            to="/evaluations"
            className={({ isActive }) =>
              isActive
                ? "text-brand-gold font-semibold transition-colors"
                : "text-brand-grey hover:text-brand-gold transition-colors"
            }
          >
            Previous Evaluations
          </NavLink>
          <NavLink
            to="/criteria-templates"
            className={({ isActive }) =>
              isActive
                ? "text-brand-gold font-semibold transition-colors"
                : "text-brand-grey-light hover:text-brand-gold transition-colors"
            }
          >
            Criteria Templates
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
