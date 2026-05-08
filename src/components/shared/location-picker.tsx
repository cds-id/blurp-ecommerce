"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { ApiError } from "@/src/lib/api/types";
import {
  listCities,
  listDistricts,
  listProvinces,
  searchLocations,
  type City,
  type District,
  type LocationSearchResult,
  type Province,
} from "@/src/lib/api/location";

export interface LocationPickerValue {
  district_id: number | null;
  province: string;
  city: string;
  district: string;
  postal_code: string;
}

interface Props {
  value: LocationPickerValue;
  onChange: (next: LocationPickerValue) => void;
  /** When true, render search input above the cascading selects. */
  enableSearch?: boolean;
}

export function LocationPicker({ value, onChange, enableSearch = true }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [provinceId, setProvinceId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>(
    value.district_id != null ? String(value.district_id) : "",
  );

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchUnsupported, setSearchUnsupported] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load provinces once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const xs = await listProvinces();
        if (!cancelled) setProvinces(xs);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Gagal memuat provinsi.");
      } finally {
        if (!cancelled) setLoadingProvinces(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load cities when province changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!provinceId) {
        if (!cancelled) setCities([]);
        return;
      }
      if (!cancelled) setLoadingCities(true);
      try {
        const xs = await listCities(provinceId);
        if (!cancelled) setCities(xs);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Gagal memuat kota.");
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceId]);

  // Load districts when city changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cityId) {
        if (!cancelled) setDistricts([]);
        return;
      }
      if (!cancelled) setLoadingDistricts(true);
      try {
        const xs = await listDistricts(cityId);
        if (!cancelled) setDistricts(xs);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Gagal memuat kecamatan.");
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  // Debounced search.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      if (!enableSearch || searchUnsupported) return;
      const q = searchQ.trim();
      if (q.length < 3) {
        if (!cancelled) setSearchResults([]);
        return;
      }
      timer = setTimeout(async () => {
        if (cancelled) return;
        setSearching(true);
        try {
          const xs = await searchLocations(q, 10);
          if (!cancelled) setSearchResults(xs);
        } catch (err) {
          if (cancelled) return;
          if (err instanceof ApiError && err.code === "NOT_IMPLEMENTED") {
            setSearchUnsupported(true);
            setSearchResults([]);
          } else {
            setSearchResults([]);
          }
        } finally {
          if (!cancelled) setSearching(false);
        }
      }, 300);
      searchTimer.current = timer;
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [searchQ, enableSearch, searchUnsupported]);

  function emit(next: Partial<LocationPickerValue>) {
    onChange({ ...value, ...next });
  }

  function pickProvince(id: string) {
    setProvinceId(id);
    setCityId("");
    setDistrictId("");
    const p = provinces.find((x) => x.province_id === id);
    emit({
      province: p?.province ?? "",
      city: "",
      district: "",
      district_id: null,
    });
  }

  function pickCity(id: string) {
    setCityId(id);
    setDistrictId("");
    const c = cities.find((x) => x.city_id === id);
    emit({
      city: c?.city_name ?? "",
      district: "",
      district_id: null,
      postal_code: c?.postal_code || value.postal_code,
    });
  }

  function pickDistrict(id: string) {
    setDistrictId(id);
    const d = districts.find((x) => x.district_id === id);
    emit({
      district: d?.district_name ?? "",
      district_id: id ? Number(id) : null,
    });
  }

  function pickSearch(r: LocationSearchResult) {
    emit({
      district_id: r.district_id,
      province: r.province,
      city: r.city,
      district: r.district,
      postal_code: r.postal_code ?? value.postal_code,
    });
    // Clear cascading selects since the value is now driven by search.
    setProvinceId("");
    setCityId("");
    setDistrictId(String(r.district_id));
    setSearchQ(r.label);
    setSearchResults([]);
  }

  const selectedSummary = useMemo(() => {
    if (!value.district_id) return null;
    return [value.district, value.city, value.province].filter(Boolean).join(", ");
  }, [value]);

  return (
    <div className="space-y-3">
      {enableSearch && !searchUnsupported && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs font-semibold text-ink mb-1.5 block">
              Cari lokasi (kecamatan / kota / kode pos)
            </span>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Min. 3 karakter, contoh: Menteng"
                className="h-11 pl-10 rounded-xl border-hairline"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted animate-spin" />
              )}
            </div>
          </label>
          {searchResults.length > 0 && (
            <ul className="rounded-xl border border-hairline bg-white shadow-sm max-h-64 overflow-auto divide-y divide-hairline">
              {searchResults.map((r) => (
                <li key={`${r.district_id}-${r.label}`}>
                  <button
                    type="button"
                    onClick={() => pickSearch(r)}
                    className="w-full text-left px-3 py-2.5 hover:bg-surface-soft transition-colors"
                  >
                    <p className="text-sm font-medium text-ink truncate">{r.label}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {[r.district, r.city, r.province, r.postal_code].filter(Boolean).join(" · ")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField
          label="Provinsi"
          value={provinceId}
          onChange={pickProvince}
          loading={loadingProvinces}
          disabled={loadingProvinces}
          placeholder={loadingProvinces ? "Memuat..." : "Pilih provinsi"}
          options={provinces.map((p) => ({ value: p.province_id, label: p.province }))}
        />
        <SelectField
          label="Kota / Kab."
          value={cityId}
          onChange={pickCity}
          loading={loadingCities}
          disabled={!provinceId || loadingCities}
          placeholder={!provinceId ? "Pilih provinsi dulu" : loadingCities ? "Memuat..." : "Pilih kota"}
          options={cities.map((c) => ({ value: c.city_id, label: c.city_name }))}
        />
        <SelectField
          label="Kecamatan"
          value={districtId}
          onChange={pickDistrict}
          loading={loadingDistricts}
          disabled={!cityId || loadingDistricts}
          placeholder={!cityId ? "Pilih kota dulu" : loadingDistricts ? "Memuat..." : "Pilih kecamatan"}
          options={districts.map((d) => ({ value: d.district_id, label: d.district_name }))}
        />
      </div>

      {selectedSummary && (
        <p className="text-xs text-muted">
          Dipilih: <span className="text-ink font-medium">{selectedSummary}</span>
          {value.district_id && (
            <span className="ml-2 text-muted">(district_id: {value.district_id})</span>
          )}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface Option {
  value: string;
  label: string;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink mb-1.5 block">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border border-hairline bg-white px-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted animate-spin pointer-events-none" />
        )}
      </div>
    </label>
  );
}
