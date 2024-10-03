import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

/**
 * PdfFullscreen component:
 * - Displays a PDF document in a fullscreen dialog/modal.
 * - Uses a trigger button to open the fullscreen modal and renders the PDF inside it.
 * - Renders all pages of the PDF, adjusts the view on window resizing, and handles errors with a toast notification.
 */
interface PdfFullscreenProps {
  fileUrl: string; // URL of the PDF file to be displayed
}

const PdfFullscreen = ({ fileUrl }: PdfFullscreenProps) => {
  /**
   * isOpen: State to manage whether the dialog/modal is open or closed.
   * numPages: Tracks the number of pages in the PDF document.
   */
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();

  const { toast } = useToast(); // Hook to display toast notifications

  /**
   * useResizeDetector: Detects resizing events (e.g., window resizing)
   * - width: Width of the container element where the PDF is rendered
   * - ref: Reference to the element being resized
   */
  const { width, ref } = useResizeDetector();

  return (
    /**
     * Dialog component:
     * - Handles modal behavior to show the PDF in fullscreen.
     * - The modal can be opened or closed by changing `isOpen` state.
     */
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v); // When dialog is closed, update the state
        }
      }}
    >
      {/* Button to trigger the fullscreen PDF view */}
      <DialogTrigger
        onClick={() => setIsOpen(true)} // Open the dialog when clicked
        asChild
      >
        <Button variant="ghost" className="gap-1.5" aria-label="fullscreen">
          <Expand className="h-4 w-4" /> {/* Expand icon for fullscreen */}
        </Button>
      </DialogTrigger>

      {/* Content of the dialog (PDF document and pages) */}
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar
          autoHide={false} // Scrollbar behavior
          className="max-h-[calc(100vh-10rem)] mt-6"
        >
          {/* Container for the PDF pages */}
          <div ref={ref}>
            {/* PDF Document rendering with error and loading handling */}
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  {/* Loader shown while the PDF is loading */}
                </div>
              }
              onLoadError={() => {
                /**
                 * If an error occurs while loading the PDF, show a toast notification
                 */
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive"
                });
              }}
              /**
               * onLoadSuccess:
               * - Sets the number of pages in the document once the PDF loads successfully.
               */
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={fileUrl} // The URL of the PDF file
              className="max-h-full"
            >
              {/* Dynamically render all pages of the PDF */}
              {new Array(numPages).fill(0).map((_, i) => (
                <Page
                  key={i} // Key for each page in the PDF
                  width={width ? width : 1} // Adjust page width to fit container
                  pageNumber={i + 1} // Display pages starting from 1
                />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullscreen;
