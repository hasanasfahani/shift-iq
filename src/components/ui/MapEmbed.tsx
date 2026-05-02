interface Props {
  lat: number;
  lng: number;
  label?: string;
}

export default function MapEmbed({ lat, lng, label }: Props) {
  const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2EF] overflow-hidden mb-4 shadow-sm">
      <iframe
        src={src}
        title={label ? `Map: ${label}` : 'Location map'}
        width="100%"
        height="200"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
