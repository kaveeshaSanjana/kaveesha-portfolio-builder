
import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  titles: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetween?: number;
}

export function TypewriterEffect({
  titles,
  typingSpeed = 100,
  deletingSpeed = 30, // Faster erasing speed (was 50)
  delayBetween = 1000,
}: TypewriterEffectProps) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [delta, setDelta] = useState(typingSpeed);

  useEffect(() => {
    const interval = setTimeout(() => {
      const currentTitle = titles[currentIndex];

      if (!isDeleting) {
        // Typing
        setText(currentTitle.substring(0, text.length + 1));
        
        // If we've completed typing the current title
        if (text === currentTitle) {
          // Pause at the end of typing before starting to delete
          setIsDeleting(true);
          setDelta(delayBetween);
        }
      } else {
        // Deleting
        setText(currentTitle.substring(0, text.length - 1));
        setDelta(deletingSpeed); // Use faster deleting speed
        
        // If we've deleted the entire text
        if (text === '') {
          setIsDeleting(false);
          setDelta(typingSpeed);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
        }
      }
    }, delta);

    return () => clearTimeout(interval);
  }, [text, isDeleting, currentIndex, delta, titles, typingSpeed, deletingSpeed, delayBetween]);

  return <span className="text-primary">{text}</span>;
}
