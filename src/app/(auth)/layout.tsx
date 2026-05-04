import Providers from "@/components/layout/Providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </Providers>
  );
}
