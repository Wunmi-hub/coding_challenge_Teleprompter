import React, { useState } from 'react'


type ModalProps = {
    onClose: () => void;
    onImport: (text: string) => void;
}

const TeleprompterModal: React.FC<ModalProps> = ({onClose, onImport}) => {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    // const extractGoogleDocId = (url: string): string | null => {
    //     const patterns = [
    //         /\/d\/(?:e\/)?([^/]+)/,      // /d/e{id}
    //         /[?&]id=([a-zA-Z0-9-_]+)/     // ?id={id}
    //     ];

    //     for (const pattern of patterns) {
    //         const match = url.match(pattern);
    //         if (match) return match[1];
    //     }

    //     return null;
    //     };


    const fetchMarkdown = async (url: string) => {
        let data;
        try{
            const response = await fetch(url);
            if(!response.ok) throw new Error('Failed to fetch file');
            data = await response.text();

        }catch (err){
            if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
        }
        return data;
    }

    async function fetchGoogleDoc(url: string) {
        try{
        const exportUrl = `${url}?output=txt`;

        const response = await fetch(`http://localhost:3001/proxy?url=${encodeURIComponent(exportUrl)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Google Doc. Make sure it is public.');
        }

        const json = await response.json();
        let body = json && json.content ? json.content : '';

        // If content appears to be HTML, parse to plain text
        if (body && body.trim().startsWith('<')) {
            const doc = new DOMParser().parseFromString(body, 'text/html');
            body = (doc.body && (doc.body.innerText || doc.body.textContent)) || '';
        }

        return body;
    }catch (err){
            if (err instanceof Error){
                setError(err.message);
            }
        }
        
    }
   
    const handleImport =  async  () => {
        let text;
        if (url.includes('raw.githubusercontent.com')){
            text = await fetchMarkdown(url)
        }else if (url.includes('docs.google.com/document')){
            text = await fetchGoogleDoc(url)
        }else {
            setError('Unsupported URL. Please enter a GitHub or Google Doc URL.');
            return;
        }
        onImport(text || '');
        setUrl("")
        onClose()
    }
return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg p-6 w-[420px] shadow-lg">
        {error && 
        <p className='text-red-300'>{error}</p>
        }
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="
            absolute top-3 right-3 
            text-red-500 hover:text-red-700 
            text-xl font-bold
          "
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Import text from URL
        </h2>

        <input
          type="text"
          placeholder="Paste GitHub or Google Docs URL"
          className="w-full border p-2 rounded mb-4"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button 
        className="w-full bg-blue-500 text-white py-2 rounded" 
        onClick={handleImport}>
          Import
        </button>
      </div>
    </div>
  )
};

export default TeleprompterModal