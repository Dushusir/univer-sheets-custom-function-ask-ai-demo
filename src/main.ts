import "./style.css";

import { LocaleType, UniverInstanceType, Univer } from "@univerjs/core";
import { defaultTheme } from "@univerjs/design";
import { UniverDocsPlugin } from "@univerjs/docs";
import { UniverDocsUIPlugin } from "@univerjs/docs-ui";
import { UniverFormulaEnginePlugin } from "@univerjs/engine-formula";
import { UniverRenderEnginePlugin } from "@univerjs/engine-render";
import { UniverSheetsPlugin } from "@univerjs/sheets";
import { UniverSheetsFormulaPlugin } from "@univerjs/sheets-formula";
import { UniverSheetsNumfmtPlugin } from "@univerjs/sheets-numfmt";
import { UniverSheetsUIPlugin } from "@univerjs/sheets-ui";
import { UniverUIPlugin } from "@univerjs/ui";
import { FUNCTION_LIST_USER, functionUser } from "./custom-function";
import { locales } from "./locales";

// univer
const univer = new Univer({
  theme: defaultTheme,
  locale: LocaleType.ZH_CN,
  locales,
});

// core plugins
univer.registerPlugin(UniverDocsPlugin, {
  hasScroll: false,
});
univer.registerPlugin(UniverDocsUIPlugin);

univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
  container: "app",
});
univer.registerPlugin(UniverSheetsPlugin);
univer.registerPlugin(UniverSheetsUIPlugin);

// sheet feature plugins
univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(UniverFormulaEnginePlugin, {
  function: functionUser,
});
univer.registerPlugin(UniverSheetsFormulaPlugin, {
  description: FUNCTION_LIST_USER,
});

// create univer sheet instance
univer.createUnit(UniverInstanceType.UNIVER_SHEET, {});
