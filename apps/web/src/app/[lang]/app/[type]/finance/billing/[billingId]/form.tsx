"use client";

import { toast } from "@/components/ui/sonner";
import type { UniRefund_CRMService_Merchants_MerchantProfileDto } from "@ayasofyazilim/saas/CRMService";
import type {
  UniRefund_FinanceService_Billings_BillingDto,
  UniRefund_FinanceService_Billings_UpdateBillingDto,
} from "@ayasofyazilim/saas/FinanceService";
import { $UniRefund_FinanceService_Billings_UpdateBillingDto } from "@ayasofyazilim/saas/FinanceService";
import { createZodObject } from "@repo/ayasofyazilim-ui/lib/create-zod-object";
import AutoForm, {
  AutoFormSubmit,
  createFieldConfigWithResource,
  CustomCombobox,
} from "@repo/ayasofyazilim-ui/organisms/auto-form";
import { useRouter } from "next/navigation";
import { putBillingApi } from "src/app/[lang]/app/actions/FinanceService/put-actions";
import type { CRMServiceServiceResource } from "src/language-data/CRMService";
import type { FinanceServiceResource } from "src/language-data/FinanceService";

const updateBillingSchema = createZodObject(
  $UniRefund_FinanceService_Billings_UpdateBillingDto,
);

export default function Form({
  billingId,
  languageData,
  billingData,
  merchants,
}: {
  billingId: string;
  billingData: UniRefund_FinanceService_Billings_BillingDto;
  languageData: {
    crm: CRMServiceServiceResource;
    finance: FinanceServiceResource;
  };
  merchants: {
    success: boolean;
    data: UniRefund_CRMService_Merchants_MerchantProfileDto[];
  };
}) {
  const router = useRouter();
  async function updateBilling(
    data: UniRefund_FinanceService_Billings_UpdateBillingDto,
  ) {
    const response = await putBillingApi({
      id: billingId,
      requestBody: data,
    });
    if (response.type === "success") {
      toast.success(languageData.finance["Billing.Update.Success"]);
      router.refresh();
    } else {
      toast.error(response.type + response.message || ["Billing.Update.Fail"]);
    }
  }

  const translatedForm = createFieldConfigWithResource({
    schema: $UniRefund_FinanceService_Billings_UpdateBillingDto,
    resources: languageData.finance,
    extend: {
      merchantId: {
        renderer: (props) => {
          return (
            <CustomCombobox<UniRefund_CRMService_Merchants_MerchantProfileDto>
              childrenProps={props}
              disabled={!merchants.success}
              emptyValue={
                merchants.success
                  ? languageData.crm["Merchant.Select"]
                  : languageData.crm["Merchants.Fetch.Fail"]
              }
              list={merchants.data}
              searchPlaceholder={languageData.finance["Select.Placeholder"]}
              searchResultLabel={languageData.finance["Select.ResultLabel"]}
              selectIdentifier="id"
              selectLabel="name"
            />
          );
        },
      },
    },
  });

  return (
    <AutoForm
      fieldConfig={translatedForm}
      formSchema={updateBillingSchema}
      onSubmit={(formdata) => {
        void updateBilling(
          formdata as UniRefund_FinanceService_Billings_UpdateBillingDto,
        );
      }}
      values={billingData}
    >
      <AutoFormSubmit className="float-right">
        {languageData.finance["Edit.Save"]}
      </AutoFormSubmit>
    </AutoForm>
  );
}
