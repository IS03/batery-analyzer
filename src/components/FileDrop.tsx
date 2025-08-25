"use client";
import { useRef } from "react";

export default function FileDrop({ onFile }: { onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="border-2 border-dashed rounded-2xl p-8 text-center">
      <p>📂 Arrastrá tu archivo o</p>
      <button
        className="mt-2 px-4 py-2 rounded-xl bg-blue-500 text-white"
        onClick={() => ref.current?.click()}
      >
        Seleccionar archivo
      </button>
      <input
        ref={ref}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
