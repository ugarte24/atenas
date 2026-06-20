import type { ImgHTMLAttributes } from 'react';
import { normalizeExternalImageUrl } from '../../lib/externalImageUrl';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

/** Imagen externa con URL Wikimedia corregida y sin referrer (hotlink). */
export function ExternalImage({ src, alt = '', ...props }: Props) {
  const resolved = normalizeExternalImageUrl(src);
  if (!resolved) return null;
  return <img src={resolved} alt={alt} referrerPolicy="no-referrer" {...props} />;
}
