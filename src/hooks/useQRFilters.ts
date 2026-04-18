"use client";

import { useState, useMemo } from "react";
import type { QRCodeItem } from "@/types/qrcode";
import type { QRType } from "@/lib/qr-formats";

interface UseQRFiltersReturn {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  filterType: "all" | QRType | "favorites";
  setFilterType: React.Dispatch<React.SetStateAction<"all" | QRType | "favorites">>;
  filterCategory: string | null;
  setFilterCategory: React.Dispatch<React.SetStateAction<string | null>>;
  filteredQRCodes: QRCodeItem[];
  uniqueCategories: string[];
}

export const useQRFilters = (qrCodes: QRCodeItem[]): UseQRFiltersReturn => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | QRType | "favorites">("all");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredQRCodes = useMemo(() => {
    return qrCodes.filter((qr) => {
      const matchesSearch =
        search === "" ||
        qr.name.toLowerCase().includes(search.toLowerCase()) ||
        qr.content.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        (filterType === "favorites" && qr.isFavorite) ||
        (filterType !== "favorites" && qr.type === filterType);
      const matchesCategory = filterCategory === null || qr.category === filterCategory;
      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [qrCodes, search, filterType, filterCategory]);

  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(
        qrCodes
          .map((qr) => qr.category)
          .filter((c): c is string => c !== null && c.trim() !== "")
      )
    ).sort();
  }, [qrCodes]);

  return {
    search,
    setSearch,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    filteredQRCodes,
    uniqueCategories,
  };
};
