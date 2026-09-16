export const Card = ({ children, className = '', hover = false }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm ${
      hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300' : ''
    } ${className}`}
  >
    {children}
  </div>
);