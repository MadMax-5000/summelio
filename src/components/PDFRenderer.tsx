"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
  Maximize2,
  RotateCw,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullScreen from "./PdfFullScreen";

interface PDFRendererProps {
  url: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFRenderer = ({ url }: PDFRendererProps) => {
  const { width, ref } = useResizeDetector();
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const isLoading = renderedScale !== scale;

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  // Setup intersection observer to track current page
  useEffect(() => {
    if (!numPages || !pageRefs.current.length) return;
    if (!containerRef.current) return;

    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageId = entry.target.id;
          const pageNumber = parseInt(pageId.split("-")[1]);
          setCurrPage(pageNumber);
          setValue("page", String(pageNumber), { shouldValidate: false });
        }
      });
    };

    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(callback, options);
    pageRefs.current.forEach((pageRef) => {
      if (pageRef) {
        observerRef.current?.observe(pageRef);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [numPages, setValue, containerRef.current]);

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    const pageNumber = Number(page);
    goToPage(pageNumber);
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= (numPages || 1)) {
      setCurrPage(pageNumber);
      setValue("page", String(pageNumber), { shouldValidate: false });
      if (pageRefs.current[pageNumber - 1]) {
        pageRefs.current[pageNumber - 1]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  // Explicitly define the ref callback to return void.
  const setContainerRef = (el: HTMLDivElement | null): void => {
    containerRef.current = el;
    return;
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-gray-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currPage <= 1}
            aria-label="previous page"
            variant="ghost"
            onClick={() => {
              const newPage = currPage - 1 > 1 ? currPage - 1 : 1;
              goToPage(newPage);
            }}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "X"}</span>
            </p>
          </div>
          <Button
            disabled={numPages === undefined || currPage === numPages}
            aria-label="next page"
            variant="ghost"
            onClick={() => {
              const newPage =
                currPage + 1 > (numPages || 1) ? (numPages || 1) : currPage + 1;
              goToPage(newPage);
            }}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Maximize2 className="size-4" />
                {scale * 100}%
                <ChevronDownIcon className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            aria-label="rotate 90 degrees"
            variant="ghost"
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCw className="size-4" />
          </Button>
          <PdfFullScreen fileUrl={url} />
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar
          autoHide={false}
          className="max-h-[calc(100vh-10rem)]"
          scrollableNodeProps={{
            ref: setContainerRef as React.Ref<HTMLDivElement>
          }}
        >
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 size-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast("Error Loading PDF");
              }}
              file={url}
              className="max-h-full"
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                pageRefs.current = Array(numPages).fill(null);
              }}
            >
              {numPages &&
                Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className={cn(
                      "mb-8",
                      currPage === index + 1 ? "scroll-mt-4" : ""
                    )}
                    ref={(el) => { pageRefs.current[index] = el; }}
                    id={`page-${index + 1}`}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute left-2 top-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs opacity-75",
                          currPage === index + 1
                            ? "bg-indigo-600"
                            : "bg-gray-800"
                        )}
                      >
                        Page {index + 1}
                      </div>
                      {isLoading && renderedScale ? (
                        <Page
                          width={width ? width : 1}
                          pageNumber={index + 1}
                          scale={scale}
                          rotate={rotation}
                          key={`loading_${index + 1}_${renderedScale}`}
                        />
                      ) : null}
                      <Page
                        className={cn(isLoading ? "hidden" : "")}
                        width={width ? width : 1}
                        pageNumber={index + 1}
                        scale={scale}
                        rotate={rotation}
                        key={`page_${index + 1}_${scale}`}
                        loading={
                          <div className="flex justify-center">
                            <Loader2 className="my-24 size-6 animate-spin" />
                          </div>
                        }
                        onRenderSuccess={() => {
                          if (index === 0) setRenderedScale(scale);
                        }}
                      />
                    </div>
                  </div>
                ))}
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PDFRenderer;
