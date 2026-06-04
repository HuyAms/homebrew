import { motion } from "motion/react";
import { Coffee } from "lucide-react";

import { Button } from "@/components/ui/button";

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Coffee className="size-8" />
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">Homebrew</h1>
        <p className="max-w-md text-muted-foreground">
          Coffee brewing playground. The deployable shell is up — the
          playground gets built on top of it.
        </p>
        <Button>Brew</Button>
      </motion.div>
    </main>
  );
}

export default App;
