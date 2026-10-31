/** Keep older image URLs usable while serving responsive WebP room photos. */
export function roomImageSrcSet(src: string): string | undefined {
  if (!src.endsWith("-1200.webp")) return undefined;
  return `${src.replace(/-1200\.webp$/, "-640.webp")} 640w, ${src} 1200w`;
}
