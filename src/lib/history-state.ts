// Typed navigation state used to carry a design summary into the contact form.
import "@tanstack/react-router";

declare module "@tanstack/history" {
  interface HistoryState {
    summary?: string;
    city?: string;
  }
}

export {};
