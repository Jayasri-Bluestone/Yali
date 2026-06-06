import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX, X, ExternalLink } from 'lucide-react';

// Fallback curated public preview videos (Mixkit)
const FALLBACK_VIDEOS = [
  {
    id: 'hv-1',
    title: 'Luxury Villa Tour',
    category: 'real-estate',
    shortTitle: 'Villa Tour',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-44141-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
    duration: '0:15',
  },
  {
    id: 'hv-2',
    title: 'Car Polish & Shine',
    category: 'car-accessories',
    shortTitle: 'Car Shine',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-cleaning-his-car-40277-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80',
    duration: '0:12',
  },
  {
    id: 'hv-3',
    title: 'Organic Farm Fresh',
    category: 'organic-groceries',
    shortTitle: 'Farm Fresh',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetables-in-a-crate-in-the-kitchen-40284-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    duration: '0:15',
  },
  {
    id: 'hv-4',
    title: 'Cycling Adventures',
    category: 'bike-accessories',
    shortTitle: 'Cycling',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-cyclist-riding-on-a-road-in-the-forest-41604-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80',
    duration: '0:11',
  },
  {
    id: 'hv-5',
    title: 'Fresh Milk & Cooking',
    category: 'organic-groceries',
    shortTitle: 'Fresh Milk',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-fresh-milk-into-a-glass-on-a-wooden-table-40294-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    duration: '0:11',
  },
  {
    id: 'hv-6',
    title: 'Cozy Living Spaces',
    category: 'properties',
    shortTitle: 'Living Room',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-cozy-living-room-with-active-fireplace-43093-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    duration: '0:09',
  },
  {
    id: 'hv-7',
    title: 'Bicycle Maintenance',
    category: 'bike-accessories',
    shortTitle: 'Bike Care',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-man-hands-installing-a-wheel-on-a-bicycle-41603-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    duration: '0:14',
  },
  {
    id: 'hv-8',
    title: 'Property Key Handover',
    category: 'properties',
    shortTitle: 'Key Handover',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-real-estate-agent-holding-house-keys-40226-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
    duration: '0:14',
  },
];

const CATEGORY_COLORS = {
  'real-estate': 'from-blue-600 to-blue-400',
  'properties': 'from-emerald-600 to-cyan-400',
  'bike-accessories': 'from-cyan-500 to-blue-500',
  'car-accessories': 'from-purple-600 to-blue-500',
  'organic-groceries': 'from-amber-500 to-emerald-500',
};

export function VideoCard({ video, onCategoryClick }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    
    // Play muted on hover, or play with sound if user explicitly unmuted
    if (isHovered || !isMuted) {
      el.muted = isMuted;
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isHovered, isMuted]);

  const handleCardClick = () => {
    setIsMuted(!isMuted);
  };

  const categoryGradient = CATEGORY_COLORS[video.category] || 'from-gray-600 to-gray-400';

  return (
    <>

      {/* Card */}
      <div
        className="relative flex-shrink-0 w-36 sm:w-44 md:w-48 rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        style={{ aspectRatio: '9/16' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Background thumbnail */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Video element (plays on hover) */}
        <video
          ref={videoRef}
          src={video.url}
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top category pill */}
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${categoryGradient} px-2.5 py-0.5 rounded-full transition-opacity duration-300 ${(isHovered || !isMuted) ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-white text-[9px] font-black uppercase tracking-wider">
            {video.category?.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Play icon (or volume icon if playing with sound) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${(!isHovered && isMuted) ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Volume toggle icon shown when hovered or unmuted */}
        <div className={`absolute top-3 left-3 flex gap-2 transition-opacity duration-300 ${(isHovered || !isMuted) ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>



        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <p className="text-white text-xs font-bold line-clamp-2 leading-tight">{video.title}</p>
        </div>
      </div>
    </>
  );
}

export function HomeVideoSection({ videos: backendVideos = [], onCategoryClick }) {
  // Merge backend videos with fallback (backend takes priority if any)
  const normalised = backendVideos.map((v) => ({
    id: `bv-${v.id}`,
    title: v.title,
    shortTitle: v.shortTitle || v.title,
    category: v.category,
    url: v.url,
    thumbnail: v.thumbnail || `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80`,
    duration: v.duration || '0:15',
  }));
  const displayVideos = normalised.length > 0 ? normalised : FALLBACK_VIDEOS;

  return (
    <section className="mt-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center shadow-md">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Video Showcase</h2>
            <p className="text-xs text-gray-500 font-medium">Tap to explore · Scroll for more</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          {displayVideos.length} videos
        </span>
      </div>

      {/* Horizontal reel */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {displayVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>
    </section>
  );
}
