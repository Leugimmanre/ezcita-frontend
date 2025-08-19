// middlewares/setPageTitle.js
// Genera título dinámico para las páginas
export function setPageTitleMiddleware(router) {
  router.beforeEach((to, _from, next) => {
    const baseTitle = 'Barbershop';
    const pageTitle = to.meta?.title;
    document.title = pageTitle ? `${baseTitle} | ${pageTitle}` : baseTitle;
    next();
  });
}
