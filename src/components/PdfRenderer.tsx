"use client";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";

// Adding Promise type safety declarations
declare global {
  interface PromiseConstructor {
    withResolvers<T = unknown>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: any) => void;
    };
  }
}

// Polyfill for Promise.withResolvers
// Adds a utility method for creating promises with externally accessible resolve/reject functions
if (typeof Promise.withResolvers === "undefined") {
  (Promise as any).withResolvers = function () {
    let resolve: (value: unknown) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

// Set the worker source for pdf.js (used to process and render PDF files)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Interface for the props accepted by the PdfRenderer component
interface PdfRendererProps {
  url: string; // URL of the PDF to render
}

/**
 * PdfRenderer Component:
 * - Renders a PDF document within the component, allowing for pagination, zoom, and rotation controls.
 * - Handles loading state, PDF page validation, and custom inputs for page navigation.
 */
export default function PdfRenderer({ url }: PdfRendererProps) {
  // Detect width for responsive scaling
  const { width, ref } = useResizeDetector();

  // State hooks for managing PDF page, zoom (scale), rotation, and rendered scale
  const [numPages, setNumPages] = useState<number>(); // Total number of pages in the PDF
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page being viewed
  const [scale, setScale] = useState<number>(1); // Scale for zooming in/out of the PDF
  const [rotation, setRotation] = useState<number>(0); // Rotation angle for the PDF
  const [renderedScale, setRenderedScale] = useState<number | null>(null); // Tracks the scale of the rendered PDF

  // Determines if the PDF is still being rendered
  const isLoading = renderedScale !== scale;

  const { toast } = useToast(); // Toast notifications for displaying errors

  // Zod schema for validating page input (ensures the input is within valid page numbers)
  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!) // Ensures valid page number
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>; // Type inference for the form schema

  // React Hook Form setup for managing form inputs and validation
  const {
    register, // Register form inputs
    handleSubmit, // Form submit handler
    formState: { errors }, // Tracks form validation errors
    setValue // Function to programmatically set form input values
  } = useForm<TCustomPageValidator>({
    defaultValues: { page: "1" }, // Default page is set to 1
    resolver: zodResolver(CustomPageValidator) // Zod validation for the form
  });

  // Handle manual page submission via form input
  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrentPage(Number(page)); // Update the current page
    setValue("page", String(page)); // Update the form input value
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-1/4 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1 5">
          {/*Button: pagination -prev */}
          <Button
            disabled={currentPage <= 1} // Disable if on the first page
            onClick={() => {
              setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1)); // Go to the previous page
              setValue("page", String(currentPage - 1)); // Update the form input value
            }}
            variant="ghost"
            aria-label="previous-page"
          >
            <ChevronDown className="h-4 w-4" />{" "}
            {/* Icon for going to the previous page */}
          </Button>
          <div className="flex items-center gap-1.5">
            {/* Input for entering the desired page number */}
            <Input
              {...register("page")} // Register the page input field
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)(); // Submit the form on "Enter" key press
                }
              }}
              className={cn(
                "w-12 h-8 text-black",
                errors.page && "focus-visible:outline-red-500" // Highlight input if there's an error
              )}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span> {/* Display total pages */}
            </p>
          </div>
          {/*Button: pagination -next */}
          <Button
            disabled={numPages === undefined || currentPage >= numPages} // Disable if on the last page
            onClick={() => {
              setCurrentPage(
                (prev) => (prev + 1 > numPages! ? numPages! : prev + 1) // Go to the next page
              );
              setValue("page", String(currentPage + 1)); // Update the form input value
            }}
            variant="ghost"
            aria-label="next-page"
          >
            <ChevronUp className="h-4 w-4" />{" "}
            {/* Icon for going to the next page */}
          </Button>
        </div>
        {/* Dropdown Menu for adjusting the zoom level */}
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* Options to set different zoom levels */}
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
          {/* Button to rotate the PDF by 90 degrees */}
          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          {/* Button to trigger full-screen view */}
          <PdfFullscreen fileUrl={url} />
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen">
        {/* Scrollable area for rendering the PDF */}
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive"
                });
              }}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages); // Set total pages on PDF load
              }}
              file={url} // File URL for the PDF document
              className="max-h-full"
            >
              {/* Conditional rendering for showing the loading state */}
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1} // Render the current page with the correct width
                  pageNumber={currentPage} // Current page being viewed
                  scale={scale} // Zoom scale for the PDF page
                  rotate={rotation} // Rotation angle
                  key={"@" + renderedScale} // Unique key for React rendering
                />
              ) : null}
              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)} // Set rendered scale on successful rendering
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}
