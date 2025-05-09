"use client"
import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';


import "../../styles.css"
import FileTree from '../components/file_tree';
import { useFileStore } from '../store/file_store';



export default function CodeEditor() {
  const { setOpenFiles,removeOpenFile, files, activeFile, openFiles,fileContents, sidebarWidth, setActiveFile, setFileContents, setSidebarWidth, addFileContent , filesStateNetwork } = useFileStore();
  const isResizing = useRef<any>(false);
 

  useEffect(()=> {
    filesStateNetwork.execute()
  },[])
  const handleMouseDown = () => {
    isResizing.current = true;
  };

  const handleMouseMove = (e: any) => {
    if (isResizing.current) {
      const newWidth = Math.min(Math.max(e.clientX, 150), 600); // clamp between 150px and 600px
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };



  const handleFileClick = (filepath: string) => {
    setActiveFile(filepath);
    setOpenFiles(filepath)
  };

  const handleEditorChange = (value: any) => {
    if (value !== undefined) {
      addFileContent(activeFile, value);
    }
  };

  const handleCloseTab = (filepath: string) => {
    removeOpenFile(filepath);
    if (activeFile === filepath) {
      const remainingFiles = openFiles.filter((file) => file !== filepath);
      setActiveFile(remainingFiles[0] || '');
    }
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.md')) return 'markdown';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.ts')) return 'python';
    return 'plaintext';
  };

  return (
    <div
      className="grid grid-rows-[1fr_auto] h-screen bg-[#1e1e1e] text-gray-300"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div
          className="bg-[#252526] border-r border-[#333] p-2 overflow-auto"
          style={{ width: sidebarWidth }}
        >
          <h2 className="text-sm font-semibold mb-2 text-gray-400">EXPLORER</h2>
          <FileTree tree={files} onFileClick={handleFileClick} activeFile={activeFile} />
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 cursor-col-resize bg-[#333] hover:bg-[#555]"
        ></div>

        {/* Editor Pane */}
        <div className="flex flex-col flex-1 bg-[#1e1e1e]">
          {/* Tabs Bar */}
          <div className="flex bg-[#2d2d2d] border-b border-[#333]">
            {openFiles.map((file) => (
              <div
                key={file}
                className={`flex items-center px-3 py-1 text-sm cursor-pointer ${
                  activeFile === file ? 'bg-[#1e1e1e] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
                }`}
                onClick={() => setActiveFile(file)}
              >
                {/* <span className="mr-2">{getFileIcon(file)}</span> {file.split('/').pop()} */}
                {file}
                <button
                  className="ml-2 text-gray-500 hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(file);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1">
            {activeFile ? (
              <MonacoEditor
              height="100%"
              language={getLanguage(activeFile)}
              value={fileContents[activeFile]}
              onChange={(value) => {
                handleEditorChange(value);
                // if (event && event.changes && event.changes.length > 0) {
                // const position = event.changes[0].range.startLineNumber;
                // const column = event.changes[0].range.startColumn;
                // console.log(`Line: ${position}, Column: ${column}`);
                // }
              }}
              theme="vs-dark"
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'Fira Code, monospace',
              }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
              No file open
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] text-white text-xs flex items-center justify-between px-4">
        <span></span>
        <span>Spaces: 2 | UTF-8 | LF | {getLanguage(activeFile)}</span>
      </div>
    </div>
  );
}

