"use client";
import BlenderScriptDisplay from "@/component/blender_script_display";
import ThreeScene from "@/component/model_previewer";
import PromptForm from "@/component/prompt_form";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("Create tetrahedron with color scheme");
  const [result, setResult] = useState("");
  const [url, setURL] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Function to initialize the Blender script rendering (using a mock example)
  const renderModel = (script: string) => {
    // Logic to use the Blender script and render the model on the canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // This is a placeholder: you would implement your actual Blender rendering logic here
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = "green";
        ctx.fillRect(50, 50, 200, 100); // Example drawing
        // You would use a 3D library like Three.js or WebGL for actual 3D rendering
      }
    }
  };

  useEffect(() => {
    if (result) {
      renderModel(result);
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/geminiPrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: prompt }),
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
        throw new Error(errorMessage);
      }

      const data = await res.json();

      let Result = data.script
        .replace(/^[^\n]*\n/, "")
        .replace(/```[\s\n]*$/, "")
        .trim();

      setResult("i" + Result);

      const resModel = await fetch("/api/python-script/genrate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: Result }),
      });

      const contentTypeModel = resModel.headers.get("content-type");

      if (!resModel.ok) {
        let errorMessage = "Failed to generate script";
        if (contentTypeModel && contentTypeModel.includes("application/json")) {
          const errorData = await resModel.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await resModel.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      let resultUrl = await resModel.json();
      console.log(resultUrl.output);
      const regex : RegExp = /(\{.*\})/s;

      const match = resultUrl.output.match(regex);

      if (match && match[0]) {
        const jsonString = match[0];
        try {
          const jsonResponse = JSON.parse(jsonString);
          console.log("Extracted URL:", jsonResponse.data.url);
          setURL(jsonResponse.data.url);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      } else {
        console.error("No JSON found in the response.");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 animate-fade-in grid grid-cols-2 gap-8">
        {/* Left Column: Prompt and Blender Script Display */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            🌀 Blender Script Generator
          </h1>

          <PromptForm
            prompt={prompt}
            loading={loading}
            onChange={setPrompt}
            onSubmit={handleSubmit}
          />

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg animate-fade-in">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="mt-8 animate-fade-in">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                🧾 Generated Blender Python Script:
              </h2>
              <BlenderScriptDisplay result={result} />
            </div>
          )}
        </div>

        {/* Right Column: Canvas for Model Rendering */}
        <div className="flex justify-center items-center bg-gray-50 border border-gray-300 rounded-lg h-[500px] w-full">
          <ThreeScene url={url} />
        </div>
      </div>
    </main>
  );
}
