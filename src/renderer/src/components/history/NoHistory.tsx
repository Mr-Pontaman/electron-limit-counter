import { useTranslation } from "react-i18next";

export const NoHistory = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16 text-muted-foreground">
      <p className="text-lg">{t("history.noHistory")}</p>
      <p className="text-sm mt-2">{t("history.checkLater")}</p>
    </div>
  );
};
