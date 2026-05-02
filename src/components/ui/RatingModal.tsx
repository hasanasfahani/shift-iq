'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (stars: number, comment: string) => Promise<void>;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 focus:outline-none"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`w-8 h-8 transition-colors ${star <= active ? 'text-[#FFB536]' : 'text-[#E7E2EF]'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function RatingModal({ open, title, onClose, onSubmit }: Props) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (stars === 0) return;
    setLoading(true);
    await onSubmit(stars, comment);
    setLoading(false);
    setStars(0);
    setComment('');
  }

  function handleClose() {
    setStars(0);
    setComment('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex justify-center py-2">
          <StarPicker value={stars} onChange={setStars} />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comment (optional)"
          rows={3}
          className="w-full px-3 py-2 border border-[#E7E2EF] bg-[#F3F0FB] rounded-xl text-sm text-[#12051F] placeholder:text-[#C9C4D2] focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:bg-white resize-none"
        />

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" fullWidth onClick={handleClose}>
            Skip
          </Button>
          <Button
            fullWidth
            loading={loading}
            disabled={stars === 0}
            onClick={handleSubmit}
          >
            Submit Rating
          </Button>
        </div>
      </div>
    </Modal>
  );
}
