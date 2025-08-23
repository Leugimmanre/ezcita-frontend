// middlewares/setPageTitle.js
import { getBrandSettings } from "@/services/brandAPI";

let cachedBrandName = null;

export function setPageTitleMiddleware(router) {
  router.beforeEach(async (to, _from, next) => {
    try {
      // Cargar la marca si aún no está cacheada
      if (!cachedBrandName) {
        const brand = await getBrandSettings();
        cachedBrandName = brand?.brandName || "Mi Negocio";
      }

      const pageTitle = to.meta?.title;
      document.title = pageTitle
        ? `${cachedBrandName} | ${pageTitle}`
        : cachedBrandName;
    } catch (err) {
      console.error("Error obteniendo marca:", err);
      document.title = to.meta?.title || "Mi Negocio";
    }

    next();
  });
}
