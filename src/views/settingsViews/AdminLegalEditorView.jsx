// src/views/settingsViews/AdminLegalEditorView.jsx
import AdminLegalEditor from "@/components/settingsComponents/legal/AdminLegalEditor";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function AdminLegalEditorView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Legales | ${brandName}`);

  return <AdminLegalEditor />;
}
