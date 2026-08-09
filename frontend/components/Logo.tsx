export default function Logo({
  size = "md",
  withWordmark = true,
}: {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
}) {
  const dims = { sm: 28, md: 36, lg: 48 }[size];
  const text = { sm: "text-base", md: "text-xl", lg: "text-2xl" }[size];

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="24" fill="#2E7D32" />
        <path
          d="M24 36c-6.6 0-12-5.4-12-12 0-7.2 6-11.6 11.2-13.7.4-.2.8-.2 1.2 0C29.6 12.4 35.6 16.8 35.6 24c0 6.6-5.4 12-11.6 12Z"
          fill="#EAF6EC"
        />
        <path
          d="M24 34V16M24 16c-3 2-5.5 5-5.5 9M24 22c3 1.6 6 4 6 8"
          stroke="#2E7D32"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span className={`${text} font-bold tracking-tight text-gov-navy`}>
          Eco<span className="text-brand-500">Maricá</span>
        </span>
      )}
    </div>
  );
}
