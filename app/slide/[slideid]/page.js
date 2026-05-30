import { SlidesEditor } from "@/components/slides-editor/slides-editor";

export default async function SlidesEditorPage({ params }) {
  const { slideId } = await params;
  return <SlidesEditor fileId={slideId} />;
}
