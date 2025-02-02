import { notFound } from "next/navigation";
import { getRefundTableHeadersByIdApi } from "@/actions/unirefund/ContractService/action";
import { isUnauthorized } from "@/utils/page-policy/page-policy";
import { getResourceData } from "@/language-data/unirefund/ContractService";
import RefundTableHeaderUpdateForm from "./_components/form";

export default async function Page({
  params,
}: {
  params: { lang: string; id: string };
}) {
  await isUnauthorized({
    requiredPolicies: [
      "ContractService.RefundTableDetail.Create",
      "ContractService.RefundTableDetail.Edit",
      "ContractService.RefundTableDetail.Delete",
      "ContractService.RefundTableHeader.Create",
      "ContractService.RefundTableHeader.Edit",
      "ContractService.RefundTableHeader.Delete",
    ],
    lang: params.lang,
  });

  const response = await getRefundTableHeadersByIdApi({ id: params.id });
  if (response.type !== "success") return notFound();

  const { languageData } = await getResourceData(params.lang);

  return (
    <>
      <RefundTableHeaderUpdateForm
        // languageData={languageData}
        formData={response.data}
      />
      <div className="hidden" id="page-title">
        {response.data.name}
      </div>
      <div className="hidden" id="page-description">
        {languageData["RefundTables.Edit.Description"]}
      </div>
    </>
  );
}
