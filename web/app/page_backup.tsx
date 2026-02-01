import { Shell } from "@/components/layout/Shell";
import { Header } from "@/components/layout/Header";
import { BoardView } from "@/components/views/BoardView";

export default function Home() {
  return (
    <Shell>
      <Header />
      <section className="flex-1 overflow-hidden relative">
        <BoardView />
      </section>
    </Shell>
  );
}
