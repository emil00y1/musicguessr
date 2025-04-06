import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import React from "react";
import { EnvVarWarning } from "./env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  return (
    <header>
      <nav className="w-full flex justify-center items-center border-b border-b-foreground/10">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>Hitster</Link>
          </div>
          {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
        </div>
        <ThemeSwitcher />
      </nav>
    </header>
  );
}
