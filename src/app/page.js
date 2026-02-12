"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ResearchPortal() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState("");
  const [status, setStatus] = useState("idle");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      setReport("");
      setStatus("processing");
      
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API_BASE}/api/docs/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      let data = null;
      while (!data) {
        const encodedName = encodeURIComponent(file.name);
        const checkRes = await fetch(`${API_BASE}/api/research/earning-call-summary?fileName=${encodedName}`);
        const checkData = await checkRes.json();
        
        if (checkData.report) {
          data = checkData;
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      setReport(data.report);
      setStatus("complete");
    } catch (error) {
      console.error("Analysis Error:", error);
      setStatus("idle");
      alert("Something went wrong. Please check your backend.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Research Analyst Tool</h1>
          <p className="text-slate-500 mt-2">Upload earnings transcripts for automated insights</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-8 border-b border-slate-100 bg-white">
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer mb-6"
            />
            
            <button
              onClick={handleAnalyze}
              disabled={status === "processing" || !file}
              className="w-full py-3 px-4 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-slate-300 flex justify-center items-center gap-2"
            >
              {status === "processing" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Transcript...
                </>
              ) : "Analyze Document"}
            </button>
            
            {status === "processing" && (
              <p className="text-center text-xs text-blue-500 mt-4 animate-pulse">
                Running OCR and indexing chunks. This may take a minute.
              </p>
            )}
          </div>

          {report && (
            <div className="p-8 bg-white border-t-4 border-blue-500">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                Analysis: {file?.name}
                <span className="text-xs font-normal text-slate-400">Powered by Llama-3.3</span>
              </h2>
              
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}