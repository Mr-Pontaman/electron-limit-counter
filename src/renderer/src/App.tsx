import { useState } from "react";
import { useTranslation } from "react-i18next";
import Counter from "./components/Counter";
import History from "./components/History";
import Header from "./components/Header.";

export type PageType = "home" | "history";

function App(): React.JSX.Element {
  const { t } = useTranslation();
  const [page, setPage] = useState<PageType>("home");

  return (
    <>
      <Header t={t} handleSetPage={(page) => setPage(page)} page={page} />
      {page === "home" ? <Counter t={t} /> : page === "history" ? <History t={t} /> : null}
    </>
  );
}

export default App;
