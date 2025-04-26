import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
      
        <Link
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          className="hover:underline"
          rel="noreferrer"
        >
          musicguessr
        </Link>
     
    </footer>
  );
}

export default Footer;
