import { Topbar } from "@/components/layout/topbar";

export default async function OfficePage({ }) {

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#161616] text-white">
      <Topbar />
      <main className="grid flex-1 place-items-center p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-[#a3a3a3]">Office</p>
        </div>
      </main>
    </div>
  );
}
