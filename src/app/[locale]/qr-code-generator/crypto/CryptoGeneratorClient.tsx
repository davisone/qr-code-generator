"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField, SelectField } from "@/components/seo-generator/FormField";

export const CryptoGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [currency, setCurrency] = useState<"BTC" | "ETH" | "LTC">("BTC");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const content = useMemo(() => {
    if (!address.trim()) return "";
    return buildContent("crypto", { currency, address: address.trim(), amount });
  }, [currency, address, amount]);

  const currencyOptions = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "LTC", label: "Litecoin (LTC)" },
  ];

  return (
    <GeneratorForm
      content={content}
      fileName={`crypto-${currency.toLowerCase()}-${address.slice(0, 8) || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("crypto.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("crypto.form.title")}
      formSubtitle={t("crypto.form.subtitle")}
    >
      <SelectField id="crypto-currency" label={t("crypto.form.currency")} value={currency} onChange={(v) => setCurrency(v as "BTC" | "ETH" | "LTC")} options={currencyOptions} />
      <TextField id="crypto-address" label={t("crypto.form.address")} value={address} onChange={setAddress} placeholder={t("crypto.form.address_placeholder")} required autoComplete="off" />
      <TextField id="crypto-amount" label={t("crypto.form.amount")} value={amount} onChange={setAmount} placeholder={t("crypto.form.amount_placeholder")} autoComplete="off" />
    </GeneratorForm>
  );
};
