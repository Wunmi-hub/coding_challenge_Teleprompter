import React, { useEffect, useRef, useState } from 'react'
import TeleprompterPreview from './TeleprompterPreview';
import type { PreviewHandle } from './TeleprompterPreview';
import {LinkIcon} from '@heroicons/react/24/outline'
import TeleprompterModal from './TeleprompterModal';

const TeleprompterInput = () => {
    const [input, setInput] = useState("");
    const [isScrolling, setIsScrolling] = useState(false);
    const [isShowModal, setISShowModal] = useState(false)
    const previewRef = useRef<PreviewHandle| null>(null);

    useEffect(() => (
      console.log(isShowModal)
    ), [isShowModal, setISShowModal])
    
  return (
    <div>
    <form>
        <h1 className="text-3xl font-bold text-blue-500">Teleprompter</h1>
        <p>Input text or paragraph</p>
        <button type="button" onClick={(e) => {
          e.preventDefault();
          setISShowModal(true)}}>
            <LinkIcon className='w-5 h-5 text-gray-700'></LinkIcon>
          </button>
        <textarea className='border border-gray-300'
        value={input} 
        style={{ width: "100%", minHeight: "200px" }}
        onChange={(e) => setInput(e.target.value)}>
        </textarea>
        <div>
        <button type='button' 
        onClick={() => setIsScrolling((prev) => !prev)} 
        className='bg-green-300 px-4 py-2 rounded mr-2'
        > 
        {isScrolling ? "Pause" : "Start"}
        </button>
        <button type='button' 
        onClick={() => {
          previewRef.current?.reset()
        }} 
        className='bg-yellow-300 px-4 py-2 rounded mr-2'>Reset</button>
        <button type='button' 
        onClick={() => {
          previewRef.current?.mirror()
        }} 
        className='bg-gray-300 text-black px-4 py-2 rounded'>Toggle Mirror</button>
        </div>
        {input && <TeleprompterPreview text={input} isScrolling={isScrolling} setIsScrolling={setIsScrolling} ref={previewRef}/>}

    </form>
    
    { isShowModal && <TeleprompterModal onClose={() => setISShowModal(false)} onImport={(text: string) => {
      // where you call setInput(text)
    console.log('Parent received import:', text?.slice(0,200));
      setInput(text)}}/>}
    </div>
  )
}

export default TeleprompterInput