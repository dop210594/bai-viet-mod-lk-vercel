"use client";

import { useEffect, useRef, useState } from "react";

export type TocItem = { id: string; title: string };

export default function Toc({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // Highlight the section currently being read
  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  // Escape closes; focus moves into the panel when it opens
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="icon-btn left"
        aria-label="Mở mục lục"
        aria-expanded={open}
        aria-controls="toc-panel"
        onClick={() => setOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      </button>

      <div className="toc-backdrop" data-open={open} onClick={() => close()} aria-hidden="true" />

      <nav
        id="toc-panel"
        ref={panel}
        className="toc"
        data-open={open}
        aria-label="Mục lục"
        inert={!open}
      >
        <div className="toc-head">
          <span className="toc-title">Mục lục</span>
          <button type="button" className="toc-close" aria-label="Đóng mục lục" onClick={() => close()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <ol>
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                onClick={() => close(false)}
              >
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
