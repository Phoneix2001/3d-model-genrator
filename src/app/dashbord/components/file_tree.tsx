import { ChevronDown, ChevronRight, Folder, FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import { defaultStyles, FileIcon } from "react-file-icon";

type FileTreeProps = {
  tree: any;
  onFileClick: (value: string) => any;
  activeFile: any;
  prefix?: string;
};
const getDynamicIconStyle = (fileName: string) => {
  const extension = fileName.split(".").pop();

  // Check if extension exists and is valid in defaultStyles
  if (extension && extension in defaultStyles) {
    return {
      ...defaultStyles[extension as keyof typeof defaultStyles],
      fontSize: "16px",
    }; // Adjust fontSize here
  }

  // Return a default icon style if the extension is invalid
  return { ...defaultStyles.doc, fontSize: "16px" }; // Adjust to your default styling
};
export default function FileTree({
  tree,
  onFileClick,
  activeFile,
  prefix = "",
}: FileTreeProps) {
  return (
    <div className="pl-2 space-y-1">
      {Object.entries(tree).map(([key, value]) => {
        const [isOpen, setIsOpen] = useState(true); // <--- add here for folders

        if (typeof value === "string") {
          return (
            <button
              key={prefix + key}
              className={`w-full flex items-center px-2 py-1 rounded text-sm text-gray-300 hover:bg-[#2a2d2e] ${
                activeFile === prefix + key ? "bg-[#094771] text-white" : ""
              }`}
              onClick={() => onFileClick(prefix + key)}
            >
              <span className="w-4 h-4 mr-2">
                <FileIcon
                  extension={key.split(".").pop()}
                  {...getDynamicIconStyle(key)}
                />
              </span>
              {key}
            </button>
          );
        }

        return (
          <div key={prefix + key}>
            {/* Folder Header */}
            <div className="flex items-center font-semibold text-gray-400 mb-1">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center focus:outline-none"
              >

               {isOpen ? <ChevronDown  size={20}/> :<ChevronRight size={20} />} 
                {isOpen ? (
                  <FolderOpen className="w-4 h-4 mr-2" />
                ) : (
                  <Folder className="w-4 h-4 mr-2" />
                )}
                {key}
              </button>
              {/* Add file/folder buttons */}
              <div className="ml-auto flex space-x-1">
                <button
                  className="text-gray-500 hover:text-gray-300"
                  onClick={() => {}}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-300"
                  onClick={() => {}}
                >
                  <Folder className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Folder contents */}
            {isOpen && (
              <FileTree
                tree={value}
                onFileClick={onFileClick}
                activeFile={activeFile}
                prefix={`${prefix}${key}/`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
