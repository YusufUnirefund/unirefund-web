"use server";

import type { UniRefund_SettingService_ProductGroups_ProductGroupDto } from "@ayasofyazilim/saas/SettingService";
import Button from "@repo/ayasofyazilim-ui/molecules/button";
import { FormReadyComponent } from "@repo/ui/form-ready";
import { auth } from "@repo/utils/auth/next-auth";
import { FileIcon, FileText, Plane, ReceiptText, Store } from "lucide-react";
import Link from "next/link";
import { getVatStatementHeadersByIdApi } from "src/actions/unirefund/FinanceService/actions";
import { getRefundDetailByIdApi } from "src/actions/unirefund/RefundService/actions";
import { getProductGroupsApi } from "src/actions/unirefund/SettingService/actions";
import { getTagByIdApi } from "src/actions/unirefund/TagService/actions";
import ErrorComponent from "src/app/[lang]/(main)/_components/error-component";
import { getResourceData } from "src/language-data/unirefund/TagService";
import { getBaseLink } from "src/utils";
import Invoices from "./_components/invoices";
import TagCardList, { TagCard } from "./_components/tag-card";
import TagStatusDiagram from "./_components/tag-status-diagram";
import TotalsEarnings from "./_components/totals-earnings";
import { dateToString, getStatusColor } from "./utils";

async function getApiRequests(tagId: string) {
  try {
    const session = await auth();
    const apiRequests = await Promise.all([
      await getTagByIdApi({ id: tagId }),
      await getProductGroupsApi(
        {
          maxResultCount: 1000,
        },
        session,
      ),
    ]);
    return {
      type: "success" as const,
      data: apiRequests,
    };
  } catch (error) {
    const err = error as { data?: string; message?: string };
    return {
      type: "error" as const,
      message: err.message,
    };
  }
}

export default async function Page({
  params,
}: {
  params: { tagId: string; lang: string };
}) {
  const { tagId, lang } = params;
  const { languageData } = await getResourceData(lang);

  const apiRequests = await getApiRequests(tagId);
  if (apiRequests.type === "error") {
    return (
      <ErrorComponent
        languageData={languageData}
        message={apiRequests.message || "Unknown error occurred"}
      />
    );
  }

  const [tagDetailResponse, productGroupsResponse] = apiRequests.data;

  const productGroups: UniRefund_SettingService_ProductGroups_ProductGroupDto[] =
    productGroupsResponse.data.items || [];

  const tagDetail = tagDetailResponse.data;
  const tagVatStatementHeadersResponse = tagDetail.vatStatementHeaderId
    ? await getVatStatementHeadersByIdApi(tagDetail.vatStatementHeaderId)
    : null;
  const tagVatStatementHeader =
    tagVatStatementHeadersResponse?.type === "success"
      ? tagVatStatementHeadersResponse.data
      : null;

  const tagRefundDetailResponse = tagDetail.refundId
    ? await getRefundDetailByIdApi(tagDetail.refundId)
    : null;
  const tagRefundDetail =
    tagRefundDetailResponse?.type === "success"
      ? tagRefundDetailResponse.data
      : null;
  return (
    <FormReadyComponent
      active={productGroups.length === 0}
      content={{
        icon: <FileText className="size-20 text-gray-400" />,
        title: languageData["Missing.ProductGroups.Title"],
        message: languageData["Missing.ProductGroups.Message"],
        action: (
          <Button asChild className="text-blue-500" variant="link">
            <Link href={getBaseLink("settings/product/product-groups", lang)}>
              {languageData.New}
            </Link>
          </Button>
        ),
      }}
    >
      <div className="mb-3 grid grid-cols-4 gap-3 overflow-auto pt-3">
        <div className="col-span-3 grid grid-cols-3 gap-3">
          <TagCardList
            icon={<FileIcon />}
            rows={[
              {
                name: languageData.TaxFreeTagID,
                value: tagDetail.tagNumber,
              },
              {
                name: languageData.Status,
                value: tagDetail.status,
                className: getStatusColor(tagDetail.status),
              },
              {
                name: "Issue Date",
                value: dateToString(tagDetail.issueDate || "", "tr"),
              },
              {
                name: "Expiration Date",
                value: dateToString(tagDetail.expireDate || "", "tr"),
              },
            ]}
            title={languageData.TagSummary}
          />
          <TagCardList
            icon={<Plane />}
            rows={[
              {
                name: languageData.FullName,
                value: `${tagDetail.traveller?.firstname} ${tagDetail.traveller?.lastname}`,
                link:
                  getBaseLink("parties/travellers/") + tagDetail.traveller?.id,
              },
              {
                name: languageData.TravellerDocumentNo,
                value: tagDetail.traveller?.travelDocumentNumber || "",
              },
              {
                name: languageData.Residences,
                value: tagDetail.traveller?.countryOfResidence || "",
              },
              {
                name: languageData.Nationality,
                value: tagDetail.traveller?.nationality || "",
              },
            ]}
            title={languageData.TravellerDetails}
          />
          <TagCardList
            icon={<Store />}
            rows={[
              {
                name: languageData.StoreName,
                value: tagDetail.merchant?.name || "",
                link:
                  getBaseLink("parties/merchants/") + tagDetail.merchant?.id,
              },
              {
                name: languageData.Address,
                value: tagDetail.merchant?.address?.fullText || "",
              },
              {
                name: languageData.ProductGroups,
                value:
                  tagDetail.merchant?.productGroups
                    ?.map((p) => p.description)
                    .join(", ") || "",
              },
            ]}
            title={languageData.MerchantDetails}
          />
          <div className="col-span-full">
            <TagCard icon={<ReceiptText />} title="Invoices">
              <Invoices languageData={languageData} tagDetail={tagDetail} />
            </TagCard>
          </div>
          <div className="col-span-full">
            <TagCard icon={<ReceiptText />} title="Summary">
              <TotalsEarnings
                languageData={languageData}
                tagDetail={tagDetail}
              />
            </TagCard>
          </div>
        </div>

        <TagStatusDiagram
          languageData={languageData}
          tagDetail={tagDetail}
          tagRefundDetail={tagRefundDetail}
          tagVatStatementHeader={tagVatStatementHeader}
        />
      </div>
    </FormReadyComponent>
  );
}
