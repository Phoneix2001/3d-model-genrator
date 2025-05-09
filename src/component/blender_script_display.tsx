import { useEffect, useState } from 'react';

interface BlenderScriptDisplayProps {
  result: string | null;
}

function BlenderScriptDisplay({ result }: BlenderScriptDisplayProps) {
  const [typedText, setTypedText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) return;

    setTypedText('');
    let index = 0;
    const typingSpeed = 3; // milliseconds per character

    const typeCharacter = () => {
      if (index < result.length) {
        setTypedText((prev) => prev + result.charAt(index));
        index++;
        setTimeout(typeCharacter, typingSpeed);
      }
    };

    typeCharacter();

    return () => {
      index = result.length;
    };
  }, [result]);

  const handleCopy = async () => {
    if (!typedText) return;
  
    const cleanedText = typedText
  .replace(/^``[a-zA-Z0-9]*\s*/, '')  // remove starting ``` followed by any language label
  .replace(/```[\s\n]*$/, '')           // remove ending ```
  .trim();    

    try {
      await navigator.clipboard.writeText(cleanedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2s
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  

  return (
    <div className="relative">
      <pre className="bg-gray-100 text-sm text-black p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono min-h-[150px] transition-all duration-300 shadow-sm">
        {typedText}
      </pre>
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default BlenderScriptDisplay;
