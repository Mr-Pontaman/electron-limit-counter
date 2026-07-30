import { useTranslation } from "react-i18next";
import { PageType } from "@renderer/App";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";

type Props = {
  handleSetPage: (page: PageType) => void;
  page: PageType;
};

const Header = ({ handleSetPage, page }: Props) => {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between pb-7">
      <div className="flex gap-2">
        <Button
          variant={page === "home" ? "default" : "ghost"}
          className="cursor-pointer"
          onClick={() => handleSetPage("home")}
        >
          {t("nav.home")}
        </Button>
        <Button
          variant={page === "history" ? "default" : "ghost"}
          className="cursor-pointer"
          onClick={() => handleSetPage("history")}
        >
          {t("nav.history")}
        </Button>
      </div>
      <ModeToggle />
    </header>
  );
};

export default Header;
