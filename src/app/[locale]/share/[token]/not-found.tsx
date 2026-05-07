import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("not_found");

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="bento-card p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">
          {t("share_title")}
        </h1>
        <p className="text-[#525252]">
          {t("share_description")}
        </p>
      </div>
    </div>
  );
}
