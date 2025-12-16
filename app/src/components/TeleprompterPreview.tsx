import { forwardRef,useEffect, useImperativeHandle, useRef, useState } from 'react'
import TeleprompterFormatter from './TeleprompterFormatter';


type PreviewProps = {
    text: string,
    isScrolling: boolean,
    setIsScrolling: (value: boolean) => void 
}

export type PreviewHandle = {
  reset: () => void;
  mirror:() => void;
}

export type FontFamily = 
  | 'Arial, Helvetica, sans-serif'
  | 'Times New Roman, serif'
  | "'Roboto', sans-serif"
  | "'Open Sans', sans-serif"
  | 'Courier New, monospace';

export type Theme ="dark" | "light" | "sepia";

const TeleprompterPreview = forwardRef< PreviewHandle, PreviewProps>(
  ({text, isScrolling, setIsScrolling}, ref) => {
  const [fontSize, setFontSize ] = useState("32");
  const [lineHeight, setLineHeight] = useState("1.4");
  const [speed, setSpeed] = useState("3");
  const [font, setFont] = useState<FontFamily>('Arial, Helvetica, sans-serif');
  const [theme, setTheme] = useState<Theme>('light');
  const [isMirrored, setIsMirrored] = useState(false); 
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number | null>(null);
  const style = 
    { 
          fontSize: `${fontSize}px`,
          fontFamily: font,
          lineHeight,
  };

  const cancelFrame = () => {
    if (frameIdRef.current != null){
      cancelAnimationFrame(frameIdRef.current)
      frameIdRef.current = null
    }
  }

  const scrollStep = () => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTop += Number(speed);

    if (el.scrollTop >= el.scrollHeight - el.clientHeight){
      setIsScrolling(false);
      cancelFrame()
      return
    }

    frameIdRef.current = requestAnimationFrame(scrollStep)
  }
  useEffect(() => {
    if (!isScrolling){
      cancelFrame();
      return;
    }
    
    frameIdRef.current = requestAnimationFrame(scrollStep)
    return () => cancelFrame()
  }, [isScrolling, speed])

  useImperativeHandle(ref, () => ({
    reset: () => {
      cancelFrame()
      const el = containerRef.current

      if(el){
        requestAnimationFrame(() => {
          el.scrollTop = 0;
          setIsScrolling(false);
        })
      }else {
        setIsScrolling(false);
      }
    },
    mirror: () => setIsMirrored(prev => !prev)
      })
    
  , [setIsScrolling])
  

    return (
  <div className="flex max-w-[900px] w-full gap-4 mt-4">
    {/* Preview area */}
    <div 
      ref={containerRef}
      className='flex-1 p-4 border border-gray-300 rounded-md h-[60vh] overflow-auto'
    >
      <div
        className={`flex-1 p-6 ${
          theme === 'dark' ? 'bg-black text-white' :
          theme === 'sepia' ? 'bg-[#F5DEB3] text-[#5B4636]' :
          'bg-white text-black'
        }`}
        style={
          {...style,
            transform: isMirrored ? "scale(-1)" : 'none',
            transformOrigin: 'center'
          }
        }
      >
        {text}
      </div>
    </div>

    {/* Formatter panel */}
    <div className="w-[300px]">
      <TeleprompterFormatter 
        fontSize={fontSize} 
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        speed={speed}
        setSpeed={setSpeed}
        font={font}
        setFont={setFont}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  </div>
)});

    
  

export default TeleprompterPreview;