// A simple hand-drawn-feeling leaf mark — the "vatika" (garden) signature element.
// Used small and restrained: next to the wordmark, nowhere else.
const LeafMark = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 4C10 8 6 18 8 30C8 30 20 32 28 24C34 18 32 8 20 4Z"
      fill="#2D4A3E"
    />
    <path
      d="M9 29C9 29 16 20 26 12"
      stroke="#E8A33D"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default LeafMark;
