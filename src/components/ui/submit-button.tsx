"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

export function SubmitButton({ 
  children, 
  loadingText,
  ...props 
}: React.ComponentProps<typeof Button> & { loadingText?: string }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && loadingText ? loadingText : children}
    </Button>
  );
}
