import { useState } from "react";
import { useTranslation } from "react-i18next";
import Counter from "./components/Counter";
import History from "./components/History";
import { ModeToggle } from "./components/ui/mode-toggle";
import { Button } from "./components/ui/button";

type Page = "home" | "history";

function App(): React.JSX.Element {
  const { t } = useTranslation();
  const [page, setPage] = useState<Page>("home");

  return (
    <main className="min-h-dvh w-full p-4 sm:p-10">
      <div className="flex items-center justify-between pb-7">
        <div className="flex gap-2">
          <Button
            variant={page === "home" ? "default" : "ghost"}
            className="cursor-pointer"
            onClick={() => setPage("home")}
          >
            {t("nav.home")}
          </Button>
          <Button
            variant={page === "history" ? "default" : "ghost"}
            className="cursor-pointer"
            onClick={() => setPage("history")}
          >
            {t("nav.history")}
          </Button>
        </div>
        <ModeToggle />
      </div>
      {page === "home" ? <Counter /> : <History />}
    </main>
  );
}

export default App;
