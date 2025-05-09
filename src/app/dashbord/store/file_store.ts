import { create } from 'zustand';

const initialState = {
  loading: false,
  success: false,
  error: false,
  data: null,
  errorData: null,
};

interface GetFilesNetwork {
  loading?: boolean,
  success?: boolean,
  error?: boolean,
  data?: any,
  errorData?: any,
  execute: () => void
}
interface FileState {
  files: any;
  activeFile: string;
  fileContents: { [key: string]: any };
  sidebarWidth: number;
  openFiles:  string[];
  setOpenFiles: (file:any) => void;
  removeOpenFile: (file:any) => void;
  setFiles: (files: any) => void;
  setActiveFile: (activeFile: string) => void;
  setFileContents: (fileContents: { [key: string]: any }) => void;
  setSidebarWidth: (sidebarWidth: number) => void;
  addFileContent: (filepath: string, content: string) => void;
  removeFileContent: (filepath: string) => void;
  filesStateNetwork: GetFilesNetwork
}

 const useFileStore = create<FileState>((set) => ({
  files: {},
  activeFile: '',
  fileContents: {
  },
  openFiles: [],
  setOpenFiles: (file) => set((state) => ({
    openFiles: [file,...state.openFiles],
  })),
  removeOpenFile: (file) => set((state) => ({
    openFiles: state.openFiles.filter((item) => {item !== file}),
  })),
  sidebarWidth: 300,
  setFiles: (files) => set({ files }),
  setActiveFile: (activeFile) => set({ activeFile }),
  setFileContents: (fileContents) => set({ fileContents }),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  addFileContent: (filepath, content) =>
    set((state) => ({
      fileContents: { ...state.fileContents, [filepath]: content },
    })),
  removeFileContent: (filepath) =>
    set((state) => {
      const { [filepath]: removed, ...rest } = state.fileContents;
      return { fileContents: rest };
    }),
    filesStateNetwork: {...initialState,
    execute: async () => {
        set((state) => ({
          filesStateNetwork: { ...state.filesStateNetwork, loading: true },
        }));
        try {
            const res = await fetch("/api/code-editor/files", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const contentType = res.headers.get("content-type");

            if (!res.ok) {
                let errorMessage = "Failed to generate script";
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } else {
                    const errorText = await res.text();
                    errorMessage = errorText || errorMessage;
            } 
          }

            const data = await res.json();
            const scripts = data.output.scripts;

            set((state) => ({
              files: data.output,
              fileContents:data.output.scripts,
              activeFile:Object.keys(scripts).pop(),
              openFiles:[(Object.keys(scripts).pop() ?? "")],
              filesStateNetwork: { ...state.filesStateNetwork, success: true, data: data },
            })); 
            
        } catch (err) {
            console.error("Error in data fetch:", err);
            set((state) => ({
              filesStateNetwork: { ...state.filesStateNetwork, error: true, errorData: err },
            }));
        }
    },
  }
}));



export {useFileStore}