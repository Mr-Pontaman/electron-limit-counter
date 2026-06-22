import { useState } from "react";
import Counter from "./components/counter/Counter";
import History from "./components/history/History";
import Header from "./components/layout/Header";

export type PageType = "home" | "history";

function App(): React.JSX.Element {
  const [page, setPage] = useState<PageType>("home");

  return (
    <>
      <Header handleSetPage={(page) => setPage(page)} page={page} />
      {page === "home" ? <Counter /> : page === "history" ? <History /> : null}
    </>
  );
}

export default App;
