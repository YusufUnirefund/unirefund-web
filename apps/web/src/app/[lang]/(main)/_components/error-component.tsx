"use client";
import {Button} from "@/components/ui/button";
import {signOutServer} from "@repo/utils/auth";
import {FileLock2} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import type {DefaultResource} from "src/language-data/core/Default";

export default function ErrorComponent({
  message,
  languageData,
  logout,
}: {
  message?: string;
  languageData: DefaultResource;
  logout?: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    if (logout) {
      setTimeout(() => {
        void signOutServer();
      }, 4000);
    }
  }, [logout]);
  return (
    <section className="flex h-full bg-white">
      <div className="mx-auto max-w-screen-md px-4 py-8 text-center lg:px-12 lg:py-16">
        <FileLock2 className="mx-auto mb-4 h-20 w-20 text-gray-400" />
        <h1 className="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:mb-6 xl:text-6xl">
          {languageData.SomethingWentWrong}
        </h1>
        <p className="font-light text-gray-500 md:text-lg xl:text-xl">{message || "Unknown error"}</p>
        <Button
          className="inline-flex items-center rounded-lg px-5 py-2.5 text-center text-sm font-medium text-blue-500 hover:bg-white focus:outline-none focus:ring-4"
          onClick={() => {
            if (logout) {
              void signOutServer();
              return;
            }
            router.back();
          }}
          variant="ghost">
          {logout ? "You will be logged out shortly." : "Go Back"}
        </Button>
      </div>
    </section>
  );
}
