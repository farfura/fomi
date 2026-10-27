"use client";

import { useEffect, useRef, useState } from "react";

/** Reports whether an element is inside (or near) the viewport. */
export function useInView({ rootMargin = "200px", once = false, threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, once, threshold]);

  return [ref, inView];
}
