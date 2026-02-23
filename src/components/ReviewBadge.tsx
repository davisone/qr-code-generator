"use client";

const ReviewBadge = () => {
  return (
    <a
      href="https://g.page/r/CcSyetXUJJrpEAE/review"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-lg border border-[#e5e5e5] hover:shadow-xl hover:-translate-y-0.5 transition-all group"
      aria-label="Donnez votre avis sur Google"
    >
      <svg className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-sm font-medium text-[#0a0a0a] group-hover:text-[#525252] transition">
        Donnez votre avis
      </span>
    </a>
  );
};

export { ReviewBadge };
