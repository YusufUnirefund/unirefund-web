"use client";

import { toast } from "@/components/ui/sonner";
import type {
  UniRefund_TravellerService_PersonalIdentificationCommonDatas_UpsertPersonalIdentificationDto,
  UniRefund_TravellerService_Travellers_TravellerDetailProfileDto,
} from "@ayasofyazilim/saas/TravellerService";
import { $UniRefund_TravellerService_PersonalIdentificationCommonDatas_UpsertPersonalIdentificationDto } from "@ayasofyazilim/saas/TravellerService";
import { createZodObject } from "@repo/ayasofyazilim-ui/lib/create-zod-object";
import AutoForm, {
  AutoFormSubmit,
  createFieldConfigWithResource,
  CustomCombobox,
} from "@repo/ayasofyazilim-ui/organisms/auto-form";
import type { CountryDto } from "src/app/[lang]/app/actions/LocationService/types";
import { putTravellerPersonalIdentificationApi } from "src/app/[lang]/app/actions/TravellerService/put-actions";
import type { TravellerServiceResource } from "src/language-data/TravellerService";

const updateBillingSchema = createZodObject(
  $UniRefund_TravellerService_PersonalIdentificationCommonDatas_UpsertPersonalIdentificationDto,
  [
    "travelDocumentNumber",
    "firstName",
    "lastName",
    "middleName",
    "issueDate",
    "expirationDate",
    "birthDate",
    "nationalityCountryCode2",
    "residenceCountryCode2",
    "identificationType",
  ],
);

export default function Form({
  languageData,
  travellerId,
  travellerData,
  countryList,
}: {
  languageData: TravellerServiceResource;
  travellerId: string;
  travellerData: UniRefund_TravellerService_Travellers_TravellerDetailProfileDto;
  countryList: { data: CountryDto[]; success: boolean };
}) {
  async function putTravellerPersonalIdentification(
    data: UniRefund_TravellerService_PersonalIdentificationCommonDatas_UpsertPersonalIdentificationDto,
  ) {
    const response = await putTravellerPersonalIdentificationApi({
      id: travellerId,
      requestBody: { ...data, id: travellerData.personalIdentifications[0].id },
    });
    if (response.type === "success") {
      toast.success(
        response.message ||
          languageData["Travellers.Identifications.Update.Success"],
      );
    } else {
      toast.error(
        `${response.status}: ${
          response.message ||
          languageData["Travellers.Identifications.Update.Error"]
        }`,
      );
    }
  }

  const translatedForm = createFieldConfigWithResource({
    schema:
      $UniRefund_TravellerService_PersonalIdentificationCommonDatas_UpsertPersonalIdentificationDto,
    resources: languageData,
    name: "Form.personalIdentification",
    extend: {
      nationalityCountryCode2: {
        renderer: (props) => (
          <CustomCombobox<CountryDto>
            childrenProps={props}
            disabled={!countryList.success}
            emptyValue={
              countryList.success
                ? languageData["Country.Select"]
                : languageData["Country.Fetch.Fail"]
            }
            list={countryList.data}
            searchPlaceholder={languageData["Select.Placeholder"]}
            searchResultLabel={languageData["Select.ResultLabel"]}
            selectIdentifier="code2"
            selectLabel="name"
          />
        ),
      },
      residenceCountryCode2: {
        renderer: (props) => (
          <CustomCombobox<CountryDto>
            childrenProps={props}
            disabled={!countryList.success}
            emptyValue={
              countryList.success
                ? languageData["Country.Select"]
                : languageData["Country.Fetch.Fail"]
            }
            list={countryList.data}
            searchPlaceholder={languageData["Select.Placeholder"]}
            searchResultLabel={languageData["Select.ResultLabel"]}
            selectIdentifier="code2"
            selectLabel="name"
          />
        ),
      },
    },
  });

  return (
    <AutoForm
      className="grid gap-4 space-y-0 pb-4 md:grid-cols-1 lg:grid-cols-2 "
      fieldConfig={translatedForm}
      formSchema={updateBillingSchema}
      onSubmit={(values) => {
        void putTravellerPersonalIdentification(
          values as UniRefund_TravellerService_PersonalIdentificationCommonDatas_UpsertPersonalIdentificationDto,
        );
      }}
      values={travellerData.personalIdentifications[0]}
    >
      <AutoFormSubmit className="float-right">
        {languageData["Edit.Save"]}
      </AutoFormSubmit>
    </AutoForm>
  );
}