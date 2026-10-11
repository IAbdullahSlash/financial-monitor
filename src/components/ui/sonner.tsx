import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// neobrutalism.dev doesn't publish a Sonner component; this is shadcn's, styled with its tokens.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-base border-2 border-border bg-secondary-background p-4 text-sm font-base text-foreground shadow-shadow",
          title: "font-heading",
          description: "text-foreground/80",
          success: "bg-good",
          error: "bg-bad",
          actionButton: "rounded-base border-2 border-border bg-main px-2 py-1 font-heading",
          cancelButton: "rounded-base border-2 border-border bg-secondary-background px-2 py-1",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
