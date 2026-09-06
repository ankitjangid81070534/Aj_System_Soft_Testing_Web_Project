import { ArrowDownToLine, ArrowLeft, ArrowRight, Check, LogIn, LogOut, Plus, Save, Search, Send, ShieldCheck, SlidersHorizontal, Trash2, X } from "lucide-react";

/** Decorative defaults for text-only actions; caller-supplied icons are retained. */
export function ActionIcon({ label }: { label: string }) {
  const Icon = /cancel|close|dismiss/i.test(label) ? X
    : /delete|remove|revoke/i.test(label) ? Trash2
    : /sign out|log out/i.test(label) ? LogOut
    : /sign in|log in|login|portal/i.test(label) ? LogIn
    : /save|update/i.test(label) ? Save
    : /download|export/i.test(label) ? ArrowDownToLine
    : /search/i.test(label) ? Search
    : /filter|apply/i.test(label) ? SlidersHorizontal
    : /back|previous/i.test(label) ? ArrowLeft
    : /send|submit|quote|project|contact/i.test(label) ? Send
    : /create|add|new|register/i.test(label) ? Plus
    : /verify|password|secure/i.test(label) ? ShieldCheck
    : /accept|confirm|approve|continue/i.test(label) ? Check
    : ArrowRight;
  return <Icon aria-hidden="true" data-tone={Icon === Save || Icon === Check || Icon === ArrowDownToLine ? "success" : undefined} className="action-glyph" />;
}
