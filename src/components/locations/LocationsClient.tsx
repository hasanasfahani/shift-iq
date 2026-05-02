'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { BusinessLocation } from '@/types';
import { locationSchema, type LocationInput } from '@/lib/validations/location.schema';
import { CITIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Toast, useToast } from '@/components/ui/Toast';

interface Props {
  initialLocations: BusinessLocation[];
}

function parseMapsUrl(input: string): { lat: number; lng: number } | null {
  const str = input.trim();
  if (!str) return null;

  // Plain "lat,lng" or "lat, lng"
  const plainMatch = str.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (plainMatch) {
    const lat = parseFloat(plainMatch[1]);
    const lng = parseFloat(plainMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  }

  try {
    const url = new URL(str);

    // OpenStreetMap: #map=zoom/lat/lng
    if (url.hostname.includes('openstreetmap.org')) {
      const hashMatch = url.hash.match(/#map=\d+\/([-\d.]+)\/([-\d.]+)/);
      if (hashMatch) return { lat: parseFloat(hashMatch[1]), lng: parseFloat(hashMatch[2]) };
    }

    // Google Maps @lat,lng anywhere in path
    const atMatch = url.pathname.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    // ?q=lat,lng
    const q = url.searchParams.get('q');
    if (q) {
      const qMatch = q.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+)$/);
      if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    // ?ll=lat,lng (Google Maps, Waze)
    const ll = url.searchParams.get('ll');
    if (ll) {
      const llMatch = ll.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+)$/);
      if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    }

    // ?center=lat,lng
    const center = url.searchParams.get('center');
    if (center) {
      const centerMatch = center.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+)$/);
      if (centerMatch) return { lat: parseFloat(centerMatch[1]), lng: parseFloat(centerMatch[2]) };
    }
  } catch {
    // Not a valid URL — plain format already checked above
  }

  return null;
}

export default function LocationsClient({ initialLocations }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [mapsUrl, setMapsUrl] = useState('');
  const [parsedCoords, setParsedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<LocationInput>({ resolver: zodResolver(locationSchema) as any });

  const cityOptions = CITIES.map((c) => ({ value: c, label: t(`cities.${c}`) }));

  function handleMapsUrlChange(value: string) {
    setMapsUrl(value);
    const coords = parseMapsUrl(value);
    setParsedCoords(coords);
    setValue('lat', coords?.lat ?? null);
    setValue('lng', coords?.lng ?? null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const openAddModal = useCallback(() => {
    setEditingLocation(null);
    reset({ branchName: '', city: '' as any, address: '', branchPhone: '', lat: null, lng: null, arrivalInstructions: '', photoUrl: '' });
    setMapsUrl('');
    setParsedCoords(null);
    setPhotoFile(null);
    setPhotoPreview('');
    setModalOpen(true);
  }, [reset]);

  const openEditModal = useCallback(
    (loc: BusinessLocation) => {
      setEditingLocation(loc);
      reset({
        branchName: loc.branch_name,
        city: loc.city,
        address: loc.address,
        branchPhone: loc.branch_phone,
        lat: loc.lat ?? null,
        lng: loc.lng ?? null,
        arrivalInstructions: loc.arrival_instructions ?? '',
        photoUrl: loc.photos?.[0] ?? '',
      });
      if (loc.lat && loc.lng) {
        const coords = { lat: Number(loc.lat), lng: Number(loc.lng) };
        setParsedCoords(coords);
        setMapsUrl(`${Number(loc.lat).toFixed(5)}, ${Number(loc.lng).toFixed(5)}`);
      } else {
        setParsedCoords(null);
        setMapsUrl('');
      }
      setPhotoFile(null);
      setPhotoPreview(loc.photos?.[0] ?? '');
      setModalOpen(true);
    },
    [reset]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingLocation(null);
    setMapsUrl('');
    setParsedCoords(null);
    setPhotoFile(null);
    setPhotoPreview('');
  }, []);

  async function uploadPhoto(locationId: string, file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${locationId}/photo.${ext}`;
    await supabase.storage.from('location-photos').upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('location-photos').getPublicUrl(path);
    return publicUrl;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    if (editingLocation) {
      let photoUrl = data.photoUrl ?? '';
      if (photoFile) {
        photoUrl = await uploadPhoto(editingLocation.id, photoFile);
      }

      const res = await fetch(`/api/locations/${editingLocation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photoUrl }),
      });

      if (!res.ok) {
        const json = await res.json();
        show(json.error ?? t('common.error.generic'), 'error');
        return;
      }
    } else {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        show(json.error ?? t('common.error.generic'), 'error');
        return;
      }

      if (photoFile) {
        const { location } = await res.json();
        const photoUrl = await uploadPhoto(location.id, photoFile);
        await fetch(`/api/locations/${location.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, photoUrl }),
        });
      }
    }

    show(
      editingLocation
        ? t('business.locations.success.updated')
        : t('business.locations.success.added'),
      'success'
    );
    closeModal();
    router.refresh();
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
    setIsDeleting(false);
    setDeletingId(null);

    if (!res.ok) {
      show(t('common.error.generic'), 'error');
      return;
    }
    show(t('business.locations.success.deleted'), 'success');
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#12051F]">{t('business.locations.title')}</h1>
        <Button onClick={openAddModal} size="md">
          + {t('business.locations.addLocation')}
        </Button>
      </div>

      {initialLocations.length === 0 ? (
        <div className="bg-[#F7F4FC] rounded-2xl p-10 text-center">
          <p className="text-[#8B8299] mb-4">{t('business.locations.noLocations')}</p>
          <p className="text-sm text-[#8B8299] mb-6">{t('business.locations.noLocationsHint')}</p>
          <Button onClick={openAddModal}>{t('business.locations.addLocation')}</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-[#F7F4FC] rounded-2xl border border-[#E7E2EF] overflow-hidden flex flex-col"
            >
              {loc.photos?.[0] && (
                <div className="h-28 overflow-hidden shrink-0">
                  <img src={loc.photos[0]} alt={loc.branch_name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#12051F]">{loc.branch_name}</p>
                    <p className="text-sm text-[#8B8299]">{loc.city}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(loc)}
                      className="p-1.5 rounded-lg text-[#8B8299] hover:text-[#7426E8] hover:bg-[#E9DEFF] transition-colors"
                      aria-label={t('common.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingId(loc.id)}
                      className="p-1.5 rounded-lg text-[#8B8299] hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label={t('common.delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#12051F] leading-relaxed">{loc.address}</p>
                <p className="text-sm text-[#8B8299]">{loc.branch_phone}</p>
                {loc.lat && loc.lng && (
                  <p className="text-xs text-[#C9C4D2]">
                    {Number(loc.lat).toFixed(5)}, {Number(loc.lng).toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingLocation ? t('business.locations.editTitle') : t('business.locations.addTitle')}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label={t('business.locations.branchName')}
            placeholder={t('business.locations.branchNamePlaceholder')}
            error={errors.branchName?.message}
            {...register('branchName')}
          />
          <Select
            label={t('business.locations.city')}
            placeholder={t('business.locations.cityPlaceholder')}
            options={cityOptions}
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label={t('business.locations.address')}
            placeholder={t('business.locations.addressPlaceholder')}
            error={errors.address?.message}
            {...register('address')}
          />
          <Input
            label={t('business.locations.branchPhone')}
            type="tel"
            placeholder={t('business.locations.branchPhonePlaceholder')}
            error={errors.branchPhone?.message}
            {...register('branchPhone')}
          />

          {/* GPS Location via Maps URL */}
          <div>
            <p className="text-sm font-semibold text-[#12051F] mb-0.5">
              GPS Location <span className="text-[#C9C4D2] font-normal">(optional)</span>
            </p>
            <p className="text-xs text-[#8B8299] mb-2">
              Paste a Google Maps, OpenStreetMap, or Waze URL — or type coordinates like{' '}
              <span className="font-mono">33.315, 44.366</span>
            </p>
            <input
              type="text"
              value={mapsUrl}
              onChange={(e) => handleMapsUrlChange(e.target.value)}
              placeholder="https://maps.google.com/... or 33.315, 44.366"
              className="w-full rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8]"
            />
            {parsedCoords && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {parsedCoords.lat.toFixed(5)}, {parsedCoords.lng.toFixed(5)}
              </p>
            )}
            {mapsUrl && !parsedCoords && (
              <p className="text-xs text-amber-600 mt-1.5">
                Could not extract coordinates from this URL.
              </p>
            )}
          </div>

          {/* Arrival instructions */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#12051F]">
              Arrival instructions <span className="text-[#C9C4D2] font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Use the staff entrance on the north side. Ask for the manager."
              className="w-full rounded-xl border border-[#E7E2EF] bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] resize-none"
              {...register('arrivalInstructions')}
            />
          </div>

          {/* Location photo upload */}
          <div>
            <p className="text-sm font-semibold text-[#12051F] mb-0.5">
              Location photo <span className="text-[#C9C4D2] font-normal">(optional)</span>
            </p>
            <p className="text-xs text-[#8B8299] mb-2">Shown on shift cards as the venue photo.</p>

            <input
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={handlePhotoChange}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Location preview"
                  className="w-full h-36 object-cover"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-[#12051F] px-3 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors"
                >
                  Change photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-[#E7E2EF] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#7426E8] hover:bg-[#F7F4FC] transition-colors group"
              >
                <svg
                  className="w-8 h-8 text-[#C9C4D2] group-hover:text-[#7426E8] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-[#8B8299] group-hover:text-[#7426E8] transition-colors">
                  Upload photo
                </span>
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" fullWidth onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              {t('business.locations.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title={t('business.locations.deleteConfirm')}
        maxWidth="sm"
      >
        <p className="text-sm text-[#8B8299] mb-6">{t('business.locations.deleteWarning')}</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setDeletingId(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={isDeleting}
            onClick={() => deletingId && handleDelete(deletingId)}
          >
            {t('common.delete')}
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
