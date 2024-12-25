"use client";

import type {
  UniRefund_SettingService_ProductGroups_ProductGroupDto,
  UniRefund_SettingService_Vats_VatDto,
} from "@ayasofyazilim/saas/SettingService";
import { $UniRefund_SettingService_ProductGroups_UpdateProductGroupDto } from "@ayasofyazilim/saas/SettingService";
import { SchemaForm } from "@repo/ayasofyazilim-ui/organisms/schema-form";
import type { WidgetProps } from "@repo/ayasofyazilim-ui/organisms/schema-form/types";
import { createUiSchemaWithResource } from "@repo/ayasofyazilim-ui/organisms/schema-form/utils";
import { CustomCombobox } from "@repo/ayasofyazilim-ui/organisms/schema-form/widgets";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handlePostResponse } from "src/actions/core/api-utils-client";
import { putProductGroupApi } from "src/actions/unirefund/SettingService/put-actions";
import type { SettingServiceResource } from "src/language-data/unirefund/SettingService";

export default function Form({
  languageData,
  response,
  vatList,
}: {
  languageData: SettingServiceResource;
  response: UniRefund_SettingService_ProductGroups_ProductGroupDto;
  vatList: UniRefund_SettingService_Vats_VatDto[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const uiSchema = createUiSchemaWithResource({
    schema: $UniRefund_SettingService_ProductGroups_UpdateProductGroupDto,
    resources: languageData,
    extend: {
      active: {
        "ui:widget": "switch",
        "ui:className": "md:col-span-2",
      },
      food: {
        "ui:widget": "switch",
        "ui:className": "md:col-span-2",
      },
      vatId: {
        "ui:widget": "Vat",
        "ui:className": "md:col-span-2",
      },
      "ui:className": "md:grid md:grid-cols-2 md:gap-2",
    },
  });
  return (
    <SchemaForm
      className="flex flex-col gap-4"
      disabled={loading}
      filter={{
        type: "include",
        sort: true,
        keys: [
          "name",
          "articleCode",
          "unitCode",
          "companyType",
          "vatId",
          "active",
          "food",
        ],
      }}
      formData={response}
      onSubmit={(data) => {
        setLoading(true);
        const formData = data.formData;
        void putProductGroupApi({
          id: response.id || "",
          requestBody: formData,
        })
          .then((res) => {
            handlePostResponse(res, router);
          })
          .finally(() => {
            setLoading(false);
          });
      }}
      schema={$UniRefund_SettingService_ProductGroups_UpdateProductGroupDto}
      submitText={languageData["Edit.Save"]}
      uiSchema={uiSchema}
      widgets={{
        Vat: VatWidget({
          languageData,
          vatList,
        }),
      }}
    />
  );
}

const VatWidget = ({
  languageData,
  vatList,
}: {
  languageData: SettingServiceResource;
  vatList: UniRefund_SettingService_Vats_VatDto[];
}) => {
  function Widget(props: WidgetProps) {
    return (
      <CustomCombobox<UniRefund_SettingService_Vats_VatDto>
        {...props}
        emptyValue="select vat"
        list={vatList}
        searchPlaceholder={languageData["Select.Placeholder"]}
        searchResultLabel={languageData["Select.ResultLabel"]}
        selectIdentifier="id"
        selectLabel="percent"
      />
    );
  }
  return Widget;
};
