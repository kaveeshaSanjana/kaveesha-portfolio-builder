
import { useEffect, useState } from 'react';

const techLogos = [
  { name: 'React', symbol: '⚛️' },
  { name: 'TypeScript', symbol: '📘' },
  { name: 'JavaScript', symbol: '🟨' },
  { name: 'Java', symbol: '☕' },
  { name: 'Spring', symbol: '🌱' },
  { name: 'Angular', symbol: '🅰️' },
  { name: 'Node.js', symbol: '🟢' },
  { name: 'Database', symbol: '🗄️' },
  { name: 'API', symbol: '🔗' },
  { name: 'Git', symbol: '📊' },
  { name: 'Docker', symbol: '🐳' },
  { name: 'AWS', symbol: '☁️' },
];

interface FloatingLogo {
  id: number;
  x: number;
  y: number;
  speed: number;
  symbol: string;
  size: number;
  opacity: number;
}

export function FloatingTechLogos() {
  const [logos, setLogos] = useState<FloatingLogo[]>([]);

  useEffect(() => {
    // Initialize floating logos
    const initialLogos: FloatingLogo[] = techLogos.map((tech, index) => ({
      id: index,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.2 + Math.random() * 0.5,
      symbol: tech.symbol,
      size: 20 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.2,
    }));
    
    setLogos(initialLogos);

    // Animation loop
    const animateLogos = () => {
      setLogos(prevLogos =>
        prevLogos.map(logo => {
          const newX = logo.x + logo.speed;
          const resetX = newX > window.innerWidth + 50 ? -50 : newX;
          
          return {
            ...logo,
            x: resetX,
            y: logo.y + Math.sin(logo.x * 0.01) * 0.5,
          };
        })
      );
    };

    const interval = setInterval(animateLogos, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {logos.map(logo => (
        <div
          key={logo.id}
          className="absolute text-2xl transition-all duration-1000 select-none"
          style={{
            left: `${logo.x}px`,
            top: `${logo.y}px`,
            fontSize: `${logo.size}px`,
            opacity: logo.opacity,
            transform: `rotate(${logo.x * 0.1}deg)`,
          }}
        >
          {logo.symbol}
        </div>
      ))}
    </div>
  );
}
