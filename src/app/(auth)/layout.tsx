import ThreeScene from "@/components/client/ThreeScene";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <ThreeScene />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}