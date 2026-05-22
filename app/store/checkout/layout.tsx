export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-admin-canvas font-handwritten text-admin-ink">
      {children}
    </div>
  );
}
