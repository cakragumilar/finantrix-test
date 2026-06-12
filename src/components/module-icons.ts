import {
  BankIcon,
  BooksIcon,
  CalculatorIcon,
  ChartPieSliceIcon,
  CoinsIcon,
  ReceiptIcon,
  type Icon,
} from "@phosphor-icons/react";

/** Admin picks an icon key per module; students see the matching glyph. */
export const MODULE_ICONS: Record<string, Icon> = {
  bank: BankIcon,
  books: BooksIcon,
  calculator: CalculatorIcon,
  chart: ChartPieSliceIcon,
  coins: CoinsIcon,
  receipt: ReceiptIcon,
};
