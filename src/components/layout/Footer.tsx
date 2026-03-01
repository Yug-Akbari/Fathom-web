export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-surface/50 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-accent rounded-sm transform rotate-45 opacity-80"></div>
          <span className="font-poppins font-bold text-lg tracking-widest text-primary">
            FATHOM
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a href="/shop" className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors tracking-widest uppercase">Shop</a>
          <a href="/about" className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors tracking-widest uppercase">About Us</a>
          <a href="/contact" className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors tracking-widest uppercase">Contact Us</a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-400">
          © {new Date().getFullYear()} FATHOM APPLIANCES.
        </div>
      </div>
    </footer>
  );
}
