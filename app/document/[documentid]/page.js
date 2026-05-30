import { DocumentEditor } from "@/components/document-editor/document-editor";

export default async function DocumentEditorPage({ params }) {
  const { documentId } = await params;
  return <DocumentEditor fileId={documentId} />;
}
