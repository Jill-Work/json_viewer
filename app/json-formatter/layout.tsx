export default function JsonFormatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 top-16 z-40">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blurred background of previous route content */}
        <div
          id="previous-route-content"
          className="opacity-50 scale-[1.02] transition-all duration-500 ease-in-out transform-gpu blur-sm"
        />
      </div>
      <div className="relative w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        {children}
      </div>
    </div>
  );
}
