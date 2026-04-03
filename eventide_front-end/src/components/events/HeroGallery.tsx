
// src/components/Event/HeroGallery.tsx
import BackButton from '../ui/BackButton';



interface HeroGalleryProps {
  images: string[];
  title?: string;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
}




export default function HeroGallery({
  images,
  selectedIndex = 0,
  onSelect,
  onBack,
}: HeroGalleryProps) {
  return (
    <div className="relative h-96 bg-gray-900">
      <img src={images[selectedIndex]} alt="" className="w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onSelect?.(i)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              selectedIndex === i ? 'border-primary scale-110' : 'border-white/50 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <BackButton className="absolute top-4 left-4 bg-black/50 text-white" onClick={onBack} />
    </div>
  );
}
