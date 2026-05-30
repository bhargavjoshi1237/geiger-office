import { SheetEditor } from "@/components/sheet-editor/sheet-editor";

export default async function SheetEditorPage({ params }) {
  const { sheetId } = await params;
  return <SheetEditor fileId={sheetId} />;
}
