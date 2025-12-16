import React from 'react'
import type { FontFamily, Theme } from './TeleprompterPreview';

interface FormatterProps {
    fontSize: string;
    setFontSize: (value: string) => void;
    lineHeight: string;
    setLineHeight: (value: string) => void;
    speed: string;
    setSpeed: (value: string) => void;
    font: FontFamily;
    setFont: (value: FontFamily) => void;
    theme: Theme;
    setTheme: (value: Theme) => void;
}

const fontOptions: {label: string; value: FontFamily}[] = [
    {label: 'Sans-serif', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Serif', value: 'Times New Roman, serif' },
    { label: 'Roboto', value: "'Roboto', sans-serif" },
    { label: 'Open Sans', value: "'Open Sans', sans-serif" },
    { label: 'Monospace', value: 'Courier New, monospace' },
];

const themeOptions: Theme[] = ["dark", "sepia", "light"]

const TeleprompterFormatter: React.FC<FormatterProps> = ({fontSize, setFontSize, lineHeight, setLineHeight, speed, setSpeed, font, setFont, theme, setTheme}) => {
  return (
    <div>
        <div>
          <label className='block mb-2 text-sm font-medium'>
            Font Size: {fontSize}px
          </label>
          <input 
          type="range" 
          min={16} 
          max={72}
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)} 
          className='w-full'/>
          </div>
          <div>
            <label className='block mb-2 text-sm font-medium'>
            Line Height: {lineHeight}px
          </label>
          <input 
          type="range" 
          min={1} 
          max={72}
          value={lineHeight}
          onChange={(e) => setLineHeight(e.target.value)} 
          className='w-full'/>
          </div>
          <div>
            <label className='block mb-2 text-sm font-medium'>
            Scroll Speed: {speed}
          </label>
          <input 
          type="range"
          min={1}
          max={10}
          value={speed}
          onChange={(e) => setSpeed(e.target.value)} 
          className='w-full'/>
          </div>
          <div>
            <label className='block mb-2 text-sm font-medium'>
            Font Family: {font}
          </label>
          <select
          value={font}
          onChange={(e) => setFont(e.target.value as FontFamily)}
          className='p-2 border rounded'>
            
            {fontOptions.map((f) => (
                <option key={f.value}  value={f.value}>
                    {f.label}
            </option>))}
          </select>
          </div>
          <div>
            <label className='block mb-2 text-sm font-medium'>
            Theme: {theme}
          </label>
          <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          >
            {themeOptions.map((t) => (
                <option key={t} value={t}>
                    {t}
                </option>
            )
            )}
          </select>
          </div>
        </div>
  )
}

export default TeleprompterFormatter