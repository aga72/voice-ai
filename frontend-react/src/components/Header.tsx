import logo from '../assets/JDMlogo.png';

function Header() {
  return (
    <header className="bg-white px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
            <img 
              src={logo} 
              alt="JDM Technology Logo" 
              className="h-15 object-contain"
            />
          </div>
        <nav className="flex items-center gap-8">
          <button className="text-brand-grey hover:text-brand-gold transition-colors">
            Previous Scans
          </button>
          <button className="text-brand-grey-light hover:text-brand-gold transition-colors">
            Criteria Templates
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
