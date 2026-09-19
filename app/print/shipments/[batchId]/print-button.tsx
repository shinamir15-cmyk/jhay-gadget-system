"use client";

import Button from "@/components/ui/button";

export default function PrintButton() {
  return (
    <Button variant="primary" onClick={() => window.print()}>
      Print
    </Button>
  );
}