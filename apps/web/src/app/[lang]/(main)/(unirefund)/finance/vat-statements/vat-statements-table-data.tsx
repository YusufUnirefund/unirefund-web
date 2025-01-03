import type { UniRefund_FinanceService_VATStatementHeaders_VATStatementHeaderForListDto } from "@ayasofyazilim/saas/FinanceService";
import { $PagedResultDto_VATStatementHeaderForListDto } from "@ayasofyazilim/saas/FinanceService";
import type {
  TanstackTableColumnLink,
  TanstackTableCreationProps,
  TanstackTableTableActionsType,
} from "@repo/ayasofyazilim-ui/molecules/tanstack-table/types";
import { tanstackTableCreateColumnsByRowData } from "@repo/ayasofyazilim-ui/molecules/tanstack-table/utils";
import { PlusIcon } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { FinanceServiceResource } from "src/language-data/unirefund/FinanceService";
import isActionGranted from "src/utils/page-policy/action-policy";
import type { Policy } from "src/utils/page-policy/utils";

type VatStatementsTable =
  TanstackTableCreationProps<UniRefund_FinanceService_VATStatementHeaders_VATStatementHeaderForListDto>;

const links: Partial<
  Record<
    keyof UniRefund_FinanceService_VATStatementHeaders_VATStatementHeaderForListDto,
    TanstackTableColumnLink
  >
> = {};
const vatStatementsColumns = (
  locale: string,
  languageData: FinanceServiceResource,
  grantedPolicies: Record<Policy, boolean>,
) => {
  if (isActionGranted(["FinanceService.Billings.Edit"], grantedPolicies)) {
    links.merchantName = {
      prefix: "vat-statements",
      targetAccessorKey: "id",
      suffix: "/information",
    };
  }
  return tanstackTableCreateColumnsByRowData<UniRefund_FinanceService_VATStatementHeaders_VATStatementHeaderForListDto>(
    {
      rows: $PagedResultDto_VATStatementHeaderForListDto.properties.items.items
        .properties,
      languageData: {
        languageData,
        constantKey: "Form",
      },
      config: {
        locale,
      },
      links,
      badges: {
        merchantName: {
          values:
            $PagedResultDto_VATStatementHeaderForListDto.properties.items.items.properties.paymentStatus.enum.map(
              (status) => {
                const badgeClasses = {
                  Paid: "text-green-500 bg-green-100 border-green-500",
                  NotPaid: "text-red-500 bg-red-100 border-red-500",
                  PartlyPaid: "text-orange-500 bg-orange-100 border-orange-500",
                  OverPaid: "text-green-800 bg-orange-100 border-green-500",
                };
                return {
                  label: languageData[`Form.paymentStatus.${status}`],
                  badgeClassName: badgeClasses[status],
                  conditions: [
                    {
                      conditionAccessorKey: "paymentStatus",
                      when: (value) => value === status,
                    },
                  ],
                };
              },
            ),
        },
      },
      faceted: {
        status: {
          options:
            $PagedResultDto_VATStatementHeaderForListDto.properties.items.items.properties.status.enum.map(
              (x) => ({
                label: languageData[`Form.status.${x}`],
                value: x,
              }),
            ),
        },
      },
    },
  );
};

function vatStatementTableActions(
  languageData: FinanceServiceResource,
  router: AppRouterInstance,
  grantedPolicies: Record<Policy, boolean>,
) {
  const actions: TanstackTableTableActionsType[] = [];
  if (
    isActionGranted(
      ["FinanceService.VATStatementHeader.Create"],
      grantedPolicies,
    )
  ) {
    actions.push({
      type: "simple",
      cta: languageData["VatStatements.New"],
      icon: PlusIcon,
      actionLocation: "table",
      onClick: () => {
        router.push("vat-statements/new");
      },
    });
  }
  return actions;
}

function vatStatementsTable(
  languageData: FinanceServiceResource,
  router: AppRouterInstance,
  grantedPolicies: Record<Policy, boolean>,
) {
  const table: VatStatementsTable = {
    tableActions: vatStatementTableActions(
      languageData,
      router,
      grantedPolicies,
    ),
    fillerColumn: "merchantName",
    columnVisibility: {
      type: "hide",
      columns: ["id", "merchantId", "paymentStatus"],
    },
    columnOrder: [
      "merchantName",
      "invoiceNumber",
      "tagCount",
      "vatStatementDate",
      "dueDate",
      "total",
      "unpaid",
      "status",
    ],
  };
  return table;
}

export const tableData = {
  vatStatements: {
    columns: vatStatementsColumns,
    table: vatStatementsTable,
  },
};
