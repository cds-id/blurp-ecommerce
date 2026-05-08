"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  LocationPicker,
  type LocationPickerValue,
} from "@/src/components/shared/location-picker";
import type { CreateAddressPayload, UserAddress } from "@/src/lib/api/users";

export interface AddressFormValues {
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  district_id: number | null;
  is_default: boolean;
  /** Set by LocationPicker — display only. */
  district: string;
}

export function emptyAddressForm(initial?: UserAddress | null): AddressFormValues {
  return {
    label: initial?.label ?? "",
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    street: initial?.street ?? "",
    city: initial?.city ?? "",
    province: initial?.province ?? "",
    postal_code: initial?.postal_code ?? "",
    country: initial?.country ?? "Indonesia",
    district_id: initial?.district_id ?? null,
    is_default: initial?.is_default ?? false,
    district: "",
  };
}

export function toCreatePayload(v: AddressFormValues): CreateAddressPayload {
  return {
    label: v.label.trim() || undefined,
    name: v.name.trim(),
    phone: v.phone.trim(),
    street: v.street.trim(),
    city: v.city.trim(),
    province: v.province.trim(),
    postal_code: v.postal_code.trim(),
    country: v.country.trim() || "Indonesia",
    district_id: v.district_id ?? 0,
    is_default: v.is_default || undefined,
  };
}

interface Props {
  initial?: UserAddress | null;
  submitLabel: string;
  showDefaultToggle?: boolean;
  onSubmit: (values: AddressFormValues) => Promise<void>;
}

export function AddressForm({ initial, submitLabel, showDefaultToggle = true, onSubmit }: Props) {
  const [values, setValues] = useState<AddressFormValues>(() => emptyAddressForm(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AddressFormValues>(key: K, val: AddressFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function onLocationChange(loc: LocationPickerValue) {
    setValues((v) => ({
      ...v,
      district_id: loc.district_id,
      district: loc.district,
      city: loc.city || v.city,
      province: loc.province || v.province,
      postal_code: loc.postal_code || v.postal_code,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.district_id) {
      setError("Pilih kecamatan dulu (lewat pencarian atau dropdown).");
      return;
    }
    if (!values.city || !values.province) {
      setError("Kota & provinsi wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan alamat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Label (opsional)">
        <Input
          value={values.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="Rumah, Kantor, ..."
          className="h-11 rounded-xl border-hairline"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nama penerima">
          <Input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="h-11 rounded-xl border-hairline"
          />
        </Field>
        <Field label="No. HP">
          <Input
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
            inputMode="tel"
            className="h-11 rounded-xl border-hairline"
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface-soft/30 p-4 space-y-3">
        <p className="text-xs font-semibold text-ink uppercase tracking-wider">Lokasi</p>
        <LocationPicker
          value={{
            district_id: values.district_id,
            province: values.province,
            city: values.city,
            district: values.district,
            postal_code: values.postal_code,
          }}
          onChange={onLocationChange}
        />
      </div>

      <Field label="Alamat lengkap (jalan, RT/RW, no.)">
        <Input
          value={values.street}
          onChange={(e) => set("street", e.target.value)}
          required
          placeholder="Jl. ..."
          className="h-11 rounded-xl border-hairline"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Kode Pos">
          <Input
            value={values.postal_code}
            onChange={(e) => set("postal_code", e.target.value)}
            required
            inputMode="numeric"
            className="h-11 rounded-xl border-hairline"
          />
        </Field>
        <Field label="Negara">
          <Input
            value={values.country}
            onChange={(e) => set("country", e.target.value)}
            className="h-11 rounded-xl border-hairline"
          />
        </Field>
      </div>

      {showDefaultToggle && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.is_default}
            onChange={(e) => set("is_default", e.target.checked)}
            className="rounded border-hairline"
          />
          Jadikan alamat default
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-full font-semibold"
      >
        {submitting ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
