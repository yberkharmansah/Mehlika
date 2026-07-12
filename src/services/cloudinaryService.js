function isCloudinaryUrl(url = "") {
  return typeof url === "string" && /res\.cloudinary\.com/i.test(url) && /\/image\/upload\//i.test(url);
}

function injectCloudinaryTransform(url, transform) {
  if (!isCloudinaryUrl(url) || !transform) return url;
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}

function normalizeWidth(width, fallback) {
  const numericWidth = Number(width);
  return Number.isFinite(numericWidth) && numericWidth > 0 ? Math.round(numericWidth) : fallback;
}

export function getOptimizedImageUrl(
  url,
  {
    width = 1200,
    height,
    fit = "fill",
    quality = "auto:good",
    format = "auto",
  } = {}
) {
  if (!isCloudinaryUrl(url)) return url;

  const transforms = [`f_${format}`, `q_${quality}`, "dpr_auto"];
  const normalizedWidth = normalizeWidth(width, 1200);

  transforms.push(`w_${normalizedWidth}`);

  if (height) {
    transforms.push(`h_${Math.round(Number(height))}`);
  }

  if (fit === "fill") {
    transforms.push("c_fill", "g_auto");
  } else if (fit === "fit") {
    transforms.push("c_fit");
  } else if (fit === "limit") {
    transforms.push("c_limit");
  }

  return injectCloudinaryTransform(url, transforms.join(","));
}

export function getResponsiveImageAttrs(
  url,
  {
    width = 1200,
    height,
    fit = "fill",
    sizes = "100vw",
    breakpoints = [480, 768, 1024, 1440],
  } = {}
) {
  const normalizedWidth = normalizeWidth(width, 1200);
  const candidates = Array.from(
    new Set(
      breakpoints
        .map((value) => normalizeWidth(value, normalizedWidth))
        .filter((value) => value < normalizedWidth)
        .concat(normalizedWidth)
    )
  ).sort((left, right) => left - right);

  return {
    src: getOptimizedImageUrl(url, { width: normalizedWidth, height, fit }),
    srcset: candidates
      .map((candidate) => `${getOptimizedImageUrl(url, { width: candidate, height, fit })} ${candidate}w`)
      .join(", "),
    sizes,
  };
}
