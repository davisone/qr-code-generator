export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="bento-card p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">
          QR Code introuvable
        </h1>
        <p className="text-[#525252]">
          Ce QR code n&apos;existe pas ou n&apos;est plus partagé.
        </p>
      </div>
    </div>
  );
}
