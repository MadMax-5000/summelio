import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Feature() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start">
          <div>
            <Badge>Platform</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular">
              Something new!
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-zinc-500 dark:text-zinc-400">
              Managing a small business today is already tough.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-2 items-start lg:grid-cols-3 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-zinc-900 dark:text-zinc-50" />
                <div className="flex flex-col gap-1">
                  <p>Easy to use</p>
                  <p className="text-zinc-500 text-sm dark:text-zinc-400">
                    We&apos;ve made it easy to use and understand.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-zinc-900 dark:text-zinc-50" />
                <div className="flex flex-col gap-1">
                  <p>Fast and reliable</p>
                  <p className="text-zinc-500 text-sm dark:text-zinc-400">
                    We&apos;ve made it fast and reliable.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-zinc-900 dark:text-zinc-50" />
                <div className="flex flex-col gap-1">
                  <p>Beautiful and modern</p>
                  <p className="text-zinc-500 text-sm dark:text-zinc-400">
                    We&apos;ve made it beautiful and modern.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-zinc-900 dark:text-zinc-50" />
                <div className="flex flex-col gap-1">
                  <p>Easy to use</p>
                  <p className="text-zinc-500 text-sm dark:text-zinc-400">
                    We&apos;ve made it easy to use and understand.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-zinc-900 dark:text-zinc-50" />
                <div className="flex flex-col gap-1">
                  <p>Fast and reliable</p>
                  <p className="text-zinc-500 text-sm dark:text-zinc-400">
                    We&apos;ve made it fast and reliable.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-zinc-900 dark:text-zinc-50" />
                <div className="flex flex-col gap-1">
                  <p>Beautiful and modern</p>
                  <p className="text-zinc-500 text-sm dark:text-zinc-400">
                    We&apos;ve made it beautiful and modern.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };
