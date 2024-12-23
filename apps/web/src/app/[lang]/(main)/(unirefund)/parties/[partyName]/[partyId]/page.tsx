"use server";

import { SectionLayout } from "@repo/ayasofyazilim-ui/templates/section-layout-v2";
import { notFound } from "next/navigation";
import { getTableDataDetail } from "src/actions/api-requests";
import {
  getMerchantContractHeadersByMerchantIdApi,
  getRefundPointContractHeadersByRefundPointIdApi,
} from "src/actions/unirefund/ContractService/action";
import {
  getAffiliationCodeApi,
  getIndividualsByIdApi,
  getMerchantsApi,
  getTaxOfficesApi,
} from "src/actions/unirefund/CrmService/actions";
import { getCountriesApi } from "src/actions/unirefund/LocationService/actions";
import { getResourceData as getContractsResourceData } from "src/language-data/unirefund/ContractService";
import { getResourceData } from "src/language-data/unirefund/CRMService";
import { dataConfigOfParties } from "../../table-data";
import type { PartyNameType } from "../../types";
import Address from "./address/form";
import Contracts from "./contracts/table";
import Email from "./email/form";
import IndividualTable from "./individuals-table/table";
import MerchantForm from "./merchant/form";
import NameForm from "./name/form";
import OrganizationForm from "./organization/form";
import PersonalSummariesForm from "./personal-summaries/form";
import SubCompany from "./subcompanies-table/form";
import Telephone from "./telephone/form";
import type { GetPartiesDetailResult } from "./types";

export default async function Page({
  params,
}: {
  params: {
    partyId: string;
    partyName: Exclude<PartyNameType, "individuals">;
    lang: string;
  };
}) {
  const { languageData } = await getResourceData(params.lang);
  const { languageData: contractsLanguageData } =
    await getContractsResourceData(params.lang);
  const formData = dataConfigOfParties[params.partyName];

  const partyDetail = await getTableDataDetail(
    params.partyName,
    params.partyId,
  );
  if (partyDetail.type !== "success" || !partyDetail.data) {
    notFound();
  }
  const partyDetailData = partyDetail.data as GetPartiesDetailResult;
  const organizationData =
    partyDetailData.entityInformations?.[0]?.organizations?.[0];
  const individualData =
    partyDetailData.entityInformations?.[0]?.individuals?.[0];
  if (!organizationData && !individualData) {
    return notFound();
  }

  const countries = await getCountriesApi();
  const countryList =
    (countries.type === "success" && countries.data.items) || [];

  const merchants = await getMerchantsApi();
  const merchantList =
    (merchants.type === "success" &&
      merchants.data.items?.filter(
        (merchant) => merchant.id !== params.partyId,
      )) ||
    [];

  let contracts;
  if (params.partyName === "refund-points") {
    contracts = await getRefundPointContractHeadersByRefundPointIdApi({
      id: params.partyId,
    });
  }
  if (params.partyName === "merchants") {
    contracts = await getMerchantContractHeadersByMerchantIdApi({
      id: params.partyId,
    });
  }
  const taxOffices = await getTaxOfficesApi();
  const taxOfficeList =
    (taxOffices.type === "success" && taxOffices.data.items) || [];

  const sections = [
    { name: languageData.Telephone, id: "telephone" },
    { name: languageData.Address, id: "address" },
    { name: languageData.Email, id: "email" },
    { name: languageData[formData.subEntityName], id: "SubCompany" },
    { name: languageData.Individuals, id: "individuals" },
    { name: "Affiliations", id: "affiliations" },
  ];

  if (organizationData) {
    sections.unshift({
      name: languageData["Parties.Organization"],
      id: "organization",
    });
  } else {
    sections.unshift({
      name: languageData.PersonalSummaries,
      id: "personal-summaries",
    });
    sections.unshift({ name: languageData.Name, id: "name" });
  }
  if (params.partyName === "merchants") {
    sections.unshift({
      name: languageData.Merchants,
      id: "merchant-base",
    });
  }
  if (
    params.partyName === "refund-points" ||
    params.partyName === "merchants"
  ) {
    sections.push({ name: languageData.Contracts, id: "contracts" });
  }

  const individualsResponse = await getIndividualsByIdApi(
    params.partyName,
    params.partyId,
  );
  const individuals =
    individualsResponse.type === "success"
      ? individualsResponse.data
      : { items: [], totalCount: 0 };

  const affiliationCodesResponse = await getAffiliationCodeApi();

  const affiliationCodes =
    affiliationCodesResponse.type === "success"
      ? affiliationCodesResponse.data
      : { items: [], totalCount: 0 };

  return (
    <>
      <div className="h-full overflow-hidden">
        <SectionLayout sections={sections} vertical>
          {params.partyName === "merchants" &&
            "taxOfficeId" in partyDetailData && (
              <MerchantForm
                languageData={languageData}
                merchantBaseData={partyDetailData}
                merchantList={merchantList}
                partyId={params.partyId}
                partyName={params.partyName}
                taxOfficeList={taxOfficeList}
              />
            )}

          {organizationData ? (
            <OrganizationForm
              languageData={languageData}
              organizationData={organizationData}
              organizationId={organizationData.id || ""}
              partyId={params.partyId}
              partyName={params.partyName}
            />
          ) : null}

          {params.partyName === "merchants" && individualData ? (
            <>
              <NameForm
                individualData={individualData.name}
                languageData={languageData}
                partyId={params.partyId}
                partyName={params.partyName}
              />
              <PersonalSummariesForm
                individualData={individualData.personalSummaries?.[0]}
                languageData={languageData}
                partyId={params.partyId}
                partyName={params.partyName}
              />
            </>
          ) : null}

          <Telephone
            languageData={languageData}
            organizationData={organizationData || individualData}
            partyId={params.partyId}
            partyName={params.partyName}
          />

          <Address
            countryList={countryList}
            languageData={languageData}
            organizationData={organizationData || individualData}
            partyId={params.partyId}
            partyName={params.partyName}
          />

          <Email
            languageData={languageData}
            organizationData={organizationData || individualData}
            partyId={params.partyId}
            partyName={params.partyName}
          />
          <SubCompany
            languageData={languageData}
            partyId={params.partyId}
            partyName={params.partyName}
          />
          <IndividualTable
            affiliationCodes={affiliationCodes}
            languageData={languageData}
            locale={params.lang}
            partyId={params.partyId}
            partyName={params.partyName}
            response={individuals}
          />

          {contracts &&
          (params.partyName === "merchants" ||
            params.partyName === "refund-points") ? (
            <Contracts
              contractsData={
                contracts.type === "success" ? contracts.data : { items: [] }
              }
              lang={params.lang}
              languageData={{ ...languageData, ...contractsLanguageData }}
              partyId={params.partyId}
              partyName={params.partyName}
            />
          ) : null}
        </SectionLayout>
      </div>
      <div className="hidden" id="page-title">
        {`${languageData[formData.translationKey]} (${partyDetailData.entityInformations?.[0]?.organizations?.[0]?.name || `${individualData?.name?.firstName} ${individualData?.name?.lastName}`})`}
      </div>
    </>
  );
}
