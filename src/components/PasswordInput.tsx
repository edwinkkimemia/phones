"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Password field with a show/hide toggle.
export default function PasswordInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input {...props} type={show ? "text" : "password"} className={`input pr-11 ${props.className ?? ""}`} />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
